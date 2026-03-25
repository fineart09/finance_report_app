import { storageConfig } from '../config/storageConfig';

type AttachmentRow = {
  rowId: number;
  file: File | null;
};

type WritableFileHandleLike = {
  createWritable: () => Promise<{
    write: (data: Blob) => Promise<void>;
    close: () => Promise<void>;
  }>;
};

type DirectoryHandleLike = {
  getFileHandle: (name: string, options: { create: boolean }) => Promise<WritableFileHandleLike>;
};

type DirectoryPickerWindow = Window & {
  showDirectoryPicker?: () => Promise<DirectoryHandleLike>;
};

let cachedDirectoryHandle: DirectoryHandleLike | null = null;

function sanitizeFileName(fileName: string) {
  return fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
}

function getWindowWithDirectoryPicker() {
  return window as DirectoryPickerWindow;
}

async function getDirectoryHandle() {
  if (cachedDirectoryHandle) {
    return cachedDirectoryHandle;
  }

  const win = getWindowWithDirectoryPicker();
  if (!storageConfig.preferFileSystemAccess || !win.showDirectoryPicker) {
    return null;
  }

  cachedDirectoryHandle = await win.showDirectoryPicker();
  return cachedDirectoryHandle;
}

async function saveFileByDownload(file: File, fileName: string) {
  const objectUrl = URL.createObjectURL(file);

  const link = document.createElement('a');
  link.href = objectUrl;
  link.download = fileName;
  link.style.display = 'none';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(objectUrl);
}

export async function saveAttachmentsLocally(rows: AttachmentRow[]) {
  const savedPathMap = new Map<number, string>();
  const directoryHandle = await getDirectoryHandle();

  for (const row of rows) {
    if (!row.file) {
      continue;
    }

    const preparedName = `${Date.now()}-row-${row.rowId}-${sanitizeFileName(row.file.name)}`;

    if (directoryHandle) {
      const fileHandle = await directoryHandle.getFileHandle(preparedName, { create: true });
      const writable = await fileHandle.createWritable();
      await writable.write(row.file);
      await writable.close();

      savedPathMap.set(row.rowId, `${storageConfig.attachmentBasePath}/${preparedName}`);
      continue;
    }

    await saveFileByDownload(row.file, preparedName);
    savedPathMap.set(row.rowId, `${storageConfig.attachmentBasePath}/${preparedName}`);
  }

  return savedPathMap;
}
