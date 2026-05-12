// main.js
const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const { importStudentsGrades } = require('./importCSV');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  mainWindow.loadFile(path.join(__dirname, 'index.html'));
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

/* =====================================================
   DASHBOARD NAVIGATION WITH PASSWORD ENFORCEMENT
===================================================== */
ipcMain.on('open-dashboard', (event, dashboardFile) => {
  try {
    const sessionPath = path.join(__dirname, 'currentUser.json');

    if (fs.existsSync(sessionPath)) {
      const user = JSON.parse(fs.readFileSync(sessionPath, 'utf-8'));

      if (
        user.role === 'student' &&
        user.must_change_password === 1 &&
        dashboardFile === 'student_dashboard.html' &&
        dashboardFile !== 'change_password.html'
      ) {
        return mainWindow.loadFile(path.join(__dirname, 'change_password.html'));
      }
    }
  } catch (err) {
    console.error("Session check error:", err);
  }

  if (mainWindow) {
    mainWindow.loadFile(path.join(__dirname, dashboardFile));
  }
});

/* =====================================================
   CSV FILE SELECT
===================================================== */
ipcMain.handle('select-csv', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    title: 'Select CSV file',
    filters: [{ name: 'CSV Files', extensions: ['csv'] }],
    properties: ['openFile']
  });

  if (result.canceled || !result.filePaths.length) return null;
  return result.filePaths[0];
});

/* =====================================================
   CSV IMPORT HANDLER  ✅ FIXED
===================================================== */
ipcMain.handle('import-csv', async (event, filePath, teacherId) => {
  return new Promise((resolve, reject) => {
    if (!filePath) return reject("No CSV file selected");
    if (!teacherId) return reject("Teacher not authenticated");

    importStudentsGrades(filePath, teacherId, (err, message) => {
      if (err) reject(err);
      else resolve(message);
    });
  });
});
