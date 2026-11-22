/**
 * Progress photos are kept in the browser's own database on the device and
 * are never uploaded. They do not sync to other devices, and clearing the
 * browser's data removes them.
 */
export interface ProgressPhoto {
  /** `${uid}|${date}`: one photo a day per person. */
  key: string;
  uid: string;
  date: string;
  blob: Blob;
  /** Weight on the day in kg, shown under the photo. */
  weightKg?: number;
}

const DB = "wlj-photos";
const STORE = "photos";

function open(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB, 1);
    req.onupgradeneeded = () => {
      const store = req.result.createObjectStore(STORE, { keyPath: "key" });
      store.createIndex("uid", "uid");
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function run<T>(mode: IDBTransactionMode, work: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  return open().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const tx = db.transaction(STORE, mode);
        const req = work(tx.objectStore(STORE));
        tx.oncomplete = () => {
          db.close();
          resolve(req.result);
        };
        tx.onerror = tx.onabort = () => {
          db.close();
          reject(tx.error ?? req.error);
        };
      }),
  );
}

/** A person's photos, oldest first. */
export async function listPhotos(uid: string): Promise<ProgressPhoto[]> {
  const all = await run<ProgressPhoto[]>("readonly", (s) => s.index("uid").getAll(uid));
  return all.sort((a, b) => a.date.localeCompare(b.date));
}

export async function savePhoto(uid: string, date: string, blob: Blob, weightKg?: number) {
  await run("readwrite", (s) => s.put({ key: `${uid}|${date}`, uid, date, blob, weightKg } satisfies ProgressPhoto));
}

export async function deletePhoto(uid: string, date: string) {
  await run("readwrite", (s) => s.delete(`${uid}|${date}`));
}

/** Removes every photo for a person on this device, used when an account is deleted. */
export async function deleteAllPhotos(uid: string) {
  const all = await listPhotos(uid).catch(() => []);
  await Promise.all(all.map((p) => deletePhoto(uid, p.date)));
}

/** Shrinks a camera photo so a year of them stays small. */
export async function shrinkPhoto(file: File, maxSide = 1280): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return new Promise((resolve, reject) => canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Could not read that photo."))), "image/jpeg", 0.85));
}
