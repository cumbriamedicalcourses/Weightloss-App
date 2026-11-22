import {
  addDoc,
  collection,
  deleteDoc,
  deleteField,
  doc,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  updateDoc,
  where,
  writeBatch,
} from "firebase/firestore";
import { firebaseEnabled, firestore } from "./firebase";
import type { Entry, Favourite, Measurement, NewEntry, Profile, SavedMeal, WeightLog } from "./types";

type Unsub = () => void;

/** Everything the journal reads and writes, per signed-in person. */
export interface Store {
  watchProfile(uid: string, cb: (p: Profile | null) => void): Unsub;
  /** Saves the profile fields. Favourites and saved meals are kept as they are. */
  saveProfile(uid: string, p: Profile): Promise<void>;
  setFavourites(uid: string, list: Favourite[]): Promise<void>;
  setSavedMeals(uid: string, list: SavedMeal[]): Promise<void>;
  /** Sets the number of glasses of water for a day. */
  setWater(uid: string, date: string, glasses: number): Promise<void>;
  /** Saves the measurements for a day, or removes that day when given null. */
  setMeasurement(uid: string, date: string, m: Measurement | null): Promise<void>;
  /** Entries with from <= date <= to (YYYY-MM-DD). */
  watchEntries(uid: string, from: string, to: string, cb: (e: Entry[]) => void): Unsub;
  addEntry(uid: string, e: NewEntry): Promise<void>;
  deleteEntry(uid: string, id: string): Promise<void>;
  watchWeights(uid: string, cb: (w: WeightLog[]) => void): Unsub;
  setWeight(uid: string, w: WeightLog): Promise<void>;
  deleteWeight(uid: string, date: string): Promise<void>;
  /** A copy of everything held for this person. */
  exportAll(uid: string): Promise<JournalExport>;
  /** Removes the profile, every entry and every weigh-in. Cannot be undone. */
  deleteAll(uid: string): Promise<void>;
}

export interface JournalExport {
  exportedAt: string;
  profile: Profile | null;
  entries: Entry[];
  weights: WeightLog[];
}

/** Firestore drops `undefined` fields with an error, so strip them first. */
function clean<T extends object>(o: T): T {
  return Object.fromEntries(Object.entries(o).filter(([, v]) => v !== undefined)) as T;
}

const firestoreStore: Store = {
  watchProfile(uid, cb) {
    return onSnapshot(doc(firestore(), "users", uid), (snap) =>
      cb(snap.exists() ? (snap.data() as Profile) : null),
    );
  },
  async saveProfile(uid, p) {
    const fields = { ...p };
    delete fields.favourites;
    delete fields.savedMeals;
    delete fields.water;
    delete fields.measurements;
    await setDoc(doc(firestore(), "users", uid), clean(fields), { merge: true });
  },
  async setFavourites(uid, list) {
    void setDoc(doc(firestore(), "users", uid), { favourites: list.map(clean) }, { merge: true });
  },
  async setSavedMeals(uid, list) {
    const savedMeals = list.map((m) => ({ ...m, items: m.items.map(clean) }));
    void setDoc(doc(firestore(), "users", uid), { savedMeals }, { merge: true });
  },
  async setWater(uid, date, glasses) {
    void setDoc(doc(firestore(), "users", uid), { water: { [date]: glasses } }, { merge: true });
  },
  async setMeasurement(uid, date, m) {
    // A merge would keep sites that were cleared, so the day is replaced whole.
    void updateDoc(doc(firestore(), "users", uid), { [`measurements.${date}`]: m ? clean(m) : deleteField() });
  },
  watchEntries(uid, from, to, cb) {
    const q = query(
      collection(firestore(), "users", uid, "entries"),
      where("date", ">=", from),
      where("date", "<=", to),
    );
    return onSnapshot(q, (snap) => {
      const list = snap.docs.map((d) => ({ ...(d.data() as Omit<Entry, "id">), id: d.id }));
      cb(list.sort((a, b) => a.createdAt - b.createdAt));
    });
  },
  async addEntry(uid, e) {
    // Not awaited on the server round trip: offline writes resolve only once
    // synced, and the local cache already shows the entry.
    void addDoc(collection(firestore(), "users", uid, "entries"), clean({ ...e, createdAt: Date.now() }));
  },
  async deleteEntry(uid, id) {
    void deleteDoc(doc(firestore(), "users", uid, "entries", id));
  },
  watchWeights(uid, cb) {
    const q = query(
      collection(firestore(), "users", uid, "weights"),
      orderBy("date", "desc"),
      limit(180),
    );
    return onSnapshot(q, (snap) =>
      cb(snap.docs.map((d) => d.data() as WeightLog).sort((a, b) => a.date.localeCompare(b.date))),
    );
  },
  async setWeight(uid, w) {
    void setDoc(doc(firestore(), "users", uid, "weights", w.date), w);
  },
  async deleteWeight(uid, date) {
    void deleteDoc(doc(firestore(), "users", uid, "weights", date));
  },
  async exportAll(uid) {
    const db = firestore();
    const [profile, entries, weights] = await Promise.all([
      getDoc(doc(db, "users", uid)),
      getDocs(collection(db, "users", uid, "entries")),
      getDocs(collection(db, "users", uid, "weights")),
    ]);
    return {
      exportedAt: new Date().toISOString(),
      profile: profile.exists() ? (profile.data() as Profile) : null,
      entries: entries.docs
        .map((d) => ({ ...(d.data() as Omit<Entry, "id">), id: d.id }))
        .sort((a, b) => a.date.localeCompare(b.date) || a.createdAt - b.createdAt),
      weights: weights.docs.map((d) => d.data() as WeightLog).sort((a, b) => a.date.localeCompare(b.date)),
    };
  },
  async deleteAll(uid) {
    const db = firestore();
    const [entries, weights] = await Promise.all([
      getDocs(collection(db, "users", uid, "entries")),
      getDocs(collection(db, "users", uid, "weights")),
    ]);
    const refs = [...entries.docs, ...weights.docs].map((d) => d.ref);
    // Firestore accepts at most 500 writes in one batch.
    for (let i = 0; i < refs.length; i += 400) {
      const batch = writeBatch(db);
      refs.slice(i, i + 400).forEach((r) => batch.delete(r));
      await batch.commit();
    }
    await deleteDoc(doc(db, "users", uid));
  },
};

/* ---------- Preview mode: the same journal, kept in this browser ---------- */

interface LocalData {
  profile: Profile | null;
  entries: Entry[];
  weights: WeightLog[];
}

const listeners = new Set<() => void>();
const keyFor = (uid: string) => `wlj:${uid}`;

function read(uid: string): LocalData {
  try {
    const raw = localStorage.getItem(keyFor(uid));
    if (raw) return JSON.parse(raw) as LocalData;
  } catch {
    // Storage can be blocked (private windows); fall through to an empty journal.
  }
  return { profile: null, entries: [], weights: [] };
}

function write(uid: string, update: (d: LocalData) => void) {
  const data = read(uid);
  update(data);
  try {
    localStorage.setItem(keyFor(uid), JSON.stringify(data));
  } catch {
    // Nothing useful to do if storage is unavailable.
  }
  listeners.forEach((l) => l());
}

function watch(run: () => void): Unsub {
  listeners.add(run);
  run();
  return () => listeners.delete(run);
}

const localStore: Store = {
  watchProfile: (uid, cb) => watch(() => cb(read(uid).profile)),
  async saveProfile(uid, p) {
    write(uid, (d) => void (d.profile = { ...p, favourites: d.profile?.favourites, savedMeals: d.profile?.savedMeals, water: d.profile?.water, measurements: d.profile?.measurements }));
  },
  async setFavourites(uid, list) {
    write(uid, (d) => {
      if (d.profile) d.profile.favourites = list;
    });
  },
  async setSavedMeals(uid, list) {
    write(uid, (d) => {
      if (d.profile) d.profile.savedMeals = list;
    });
  },
  async setWater(uid, date, glasses) {
    write(uid, (d) => {
      if (d.profile) d.profile.water = { ...d.profile.water, [date]: glasses };
    });
  },
  async setMeasurement(uid, date, m) {
    write(uid, (d) => {
      if (!d.profile) return;
      const next = { ...d.profile.measurements };
      if (m) next[date] = m;
      else delete next[date];
      d.profile.measurements = next;
    });
  },
  watchEntries: (uid, from, to, cb) =>
    watch(() => cb(read(uid).entries.filter((e) => e.date >= from && e.date <= to))),
  async addEntry(uid, e) {
    write(uid, (d) =>
      void d.entries.push({ ...e, id: crypto.randomUUID(), createdAt: Date.now() }),
    );
  },
  async deleteEntry(uid, id) {
    write(uid, (d) => void (d.entries = d.entries.filter((e) => e.id !== id)));
  },
  watchWeights: (uid, cb) =>
    watch(() => cb([...read(uid).weights].sort((a, b) => a.date.localeCompare(b.date)))),
  async setWeight(uid, w) {
    write(uid, (d) => void (d.weights = [...d.weights.filter((x) => x.date !== w.date), w]));
  },
  async deleteWeight(uid, date) {
    write(uid, (d) => void (d.weights = d.weights.filter((x) => x.date !== date)));
  },
  async exportAll(uid) {
    return { exportedAt: new Date().toISOString(), ...read(uid) };
  },
  async deleteAll(uid) {
    try {
      localStorage.removeItem(keyFor(uid));
    } catch {
      // Nothing useful to do if storage is unavailable.
    }
    listeners.forEach((l) => l());
  },
};

export const store: Store = firebaseEnabled ? firestoreStore : localStore;
