/*
 * main-utils.ts
 *
 * Copyright (C) 2021 by RStudio, PBC
 *
 * Unless you have received this program directly from RStudio pursuant
 * to the terms of a commercial license agreement with RStudio, then
 * this program is licensed to you under the terms of version 3 of the
 * GNU Affero General Public License. This program is distributed WITHOUT
 * ANY EXPRESS OR IMPLIED WARRANTY, INCLUDING THOSE OF NON-INFRINGEMENT,
 * MERCHANTABILITY OR FITNESS FOR A PARTICULAR PURPOSE. Please refer to the
 * AGPL (http://www.gnu.org/licenses/agpl-3.0.txt) for more details.
 *
 */

/* These functions were originally in DesktopMain.cpp, moved here during porting. */

import { app } from 'electron';
import fs from 'fs';
import path from 'path';

export function augmentCommandLineArguments() {
  const user = process.env.RSTUDIO_CHROMIUM_ARGUMENTS ?? "";
  if (user.length == 0) {
    return;
  }
   
  const pieces = user.split(" ");
  pieces.forEach(piece => app.commandLine.appendArgument(piece));
}

// attempt to remove stale lockfiles that might inhibit
// RStudio startup (currently Windows only). Throws
// an error only when a stale lockfile exists, but
// we could not successfully remove it
export function removeStaleOptionsLockfile() {
  if (process.platform != 'win32') {
    return;
  }

  const appData = process.env.APPDATA ?? "";
  if (!appData.length) {
    return;
  }

  const lockFilePath = path.join(appData, "RStudio/desktop.ini.lock");
  if (!fs.existsSync(lockFilePath)) {
    return;
  }

  const diff = (Date.now() - fs.statSync(lockFilePath).mtimeMs) / 1000;
  if (diff < 10) {
    return;
  }

  fs.unlinkSync(lockFilePath);
}

function randomString() {
  return (Math.random() * 2147483647).toString();
}

export function initializeSharedSecret() {
   const sharedSecret = randomString() + randomString() + randomString();
   process.env.RS_SHARED_SECRET = sharedSecret;
}

// void initializeWorkingDirectory(int /*argc*/,
//                                 char* argv[],
//                                 const QString& filename)
// {
//    // bail if we've already got a working directory as a result of
//    // a call to openSessionInNewWindow
//    if (!core::system::getenv(kRStudioInitialWorkingDir).empty())
//       return;

//    // calculate what our initial working directory should be
//    std::string workingDir;

//    // if there is a filename passed to us then use it's path
//    if (filename != QString())
//    {
//       FilePath filePath(filename.toUtf8().constData());
//       if (filePath.exists())
//       {
//          if (filePath.isDirectory())
//             workingDir = filePath.getAbsolutePath();
//          else
//             workingDir = filePath.getParent().getAbsolutePath();
//       }
//    }

//    // do additinal detection if necessary
//    if (workingDir.empty())
//    {
//       // get current path
//       FilePath currentPath = FilePath::safeCurrentPath(
//                                        core::system::userHomePath());

// #if defined(_WIN32) || defined(__APPLE__)

//       // detect whether we were launched from the system application menu
//       // (e.g. Dock, Program File icon, etc.). we do this by checking
//       // whether the executable path is within the current path. if we
//       // weren't launched from the system app menu that set the initial
//       // wd to the current path

//       FilePath exePath;
//       Error error = core::system::executablePath(argv[0], &exePath);
//       if (!error)
//       {
//          if (!exePath.isWithin(currentPath))
//             workingDir = currentPath.getAbsolutePath();
//       }
//       else
//       {
//          LOG_ERROR(error);
//       }

// #else

//       // on linux we take the current working dir if we were launched
//       // from within a terminal
//       if (core::system::stdoutIsTerminal() &&
//          (currentPath != core::system::userHomePath()))
//       {
//          workingDir = currentPath.getAbsolutePath();
//       }

// #endif

//    }

//    // set the working dir if we have one
//    if (!workingDir.empty())
//       core::system::setenv(kRStudioInitialWorkingDir, workingDir);
// }

// void setInitialProject(const FilePath& projectFile, QString* pFilename)
// {
//    core::system::setenv(kRStudioInitialProject, projectFile.getAbsolutePath());
//    pFilename->clear();
// }

// void initializeStartupEnvironment(QString* pFilename)
// {
//    // if the filename ends with .RData or .rda then this is an
//    // environment file. if it ends with .Rproj then it is
//    // a project file. we handle both cases by setting an environment
//    // var and then resetting the pFilename so it isn't processed
//    // using the standard open file logic
//    FilePath filePath(pFilename->toUtf8().constData());
//    if (filePath.exists())
//    {
//       std::string ext = filePath.getExtensionLowerCase();

//       // if it is a directory or just an .rdata file then we can see
//       // whether there is a project file we can automatically attach to
//       if (filePath.isDirectory())
//       {
//          FilePath projectFile = r_util::projectFromDirectory(filePath);
//          if (!projectFile.isEmpty())
//          {
//             setInitialProject(projectFile, pFilename);
//          }
//       }
//       else if (ext == ".rproj")
//       {
//          setInitialProject(filePath, pFilename);
//       }
//       else if (ext == ".rdata" || ext == ".rda")
//       {
//          core::system::setenv(kRStudioInitialEnvironment, filePath.getAbsolutePath());
//          pFilename->clear();
//       }

//    }
// }

// QString verifyAndNormalizeFilename(const QString &filename)
// {
//    if (filename.isNull() || filename.isEmpty())
//       return QString();

//    QFileInfo fileInfo(filename);
//    if (fileInfo.exists())
//       return fileInfo.absoluteFilePath();
//    else
//       return QString();
// }

// bool isNonProjectFilename(const QString &filename)
// {
//    if (filename.isNull() || filename.isEmpty())
//       return false;

//    FilePath filePath(filename.toUtf8().constData());
//    return filePath.exists() && filePath.getExtensionLowerCase() != ".rproj";
// }

// #ifdef Q_OS_WIN

// namespace {

// bool isRemoteSession()
// {
//    if (::GetSystemMetrics(SM_REMOTESESSION))
//       return true;
   
//    core::system::RegistryKey key;
//    Error error = key.open(
//             HKEY_LOCAL_MACHINE,
//             "SYSTEM\\CurrentControlSet\\Control\\Terminal Server\\",
//             KEY_READ);
   
//    if (error)
//       return false;
   
//    DWORD dwGlassSessionId;
//    DWORD cbGlassSessionId = sizeof(dwGlassSessionId);
//    DWORD dwType;

//    LONG lResult = RegQueryValueEx(
//             key.handle(),
//             "GlassSessionId",
//             NULL, // lpReserved
//             &dwType,
//             (BYTE*) &dwGlassSessionId,
//             &cbGlassSessionId);

//    if (lResult != ERROR_SUCCESS)
//       return false;
   
//    DWORD dwCurrentSessionId;
//    if (ProcessIdToSessionId(GetCurrentProcessId(), &dwCurrentSessionId))
//       return dwCurrentSessionId != dwGlassSessionId;
   
//    return false;
   
// }

// } // end anonymous namespace

// QString inferDefaultRenderingEngineWindows()
// {
//    if (isRemoteSession())
//       return QStringLiteral("software");

//    // prefer software rendering for certain graphics cards
//    std::vector<std::string> blacklist = {
//       "Intel(R) HD Graphics 520",
//       "Intel(R) HD Graphics 530",
//       "Intel(R) HD Graphics 620",
//       "Intel(R) HD Graphics 630",
//    };

//    DISPLAY_DEVICE device;
//    device.cb = sizeof(DISPLAY_DEVICE);

//    DWORD i = 0;
//    while (::EnumDisplayDevices(nullptr, i++, &device, 0))
//    {
//       // skip non-primary device
//       if ((device.StateFlags & DISPLAY_DEVICE_PRIMARY_DEVICE) == 0)
//          continue;

//       // check for unsupported device
//       std::string deviceString(device.DeviceString);
//       for (auto&& item : blacklist)
//       {
//          if (deviceString.find(item) != std::string::npos)
//          {
//             QCoreApplication::setAttribute(Qt::AA_DisableShaderDiskCache, true);
//             return QStringLiteral("software");
//          }
//       }
//    }

//    return QStringLiteral("auto");
// }

// #endif /* Q_OS_WIN */

// #ifdef Q_OS_MAC

// QString inferDefaultRenderingEngineMac()
// {
//    return QStringLiteral("auto");
// }

// #endif /* Q_OS_MAC */

// #ifdef Q_OS_LINUX

// QString inferDefaultRenderingEngineLinux()
// {
//    // disable opengl when using nouveau drivers, as a large number
//    // of users have reported crashes when attempting to do so.
//    //
//    // NOTE: we'll currently assume this is fixed in the next Qt
//    // update, so guard only for older Qt for now
//    //
//    // https://github.com/rstudio/rstudio/issues/3781
//    // https://bugreports.qt.io/browse/QTBUG-73715
// #if QT_VERSION < QT_VERSION_CHECK(5, 13, 0)
//    core::system::ProcessResult result;
//    Error error = core::system::runCommand(
//             "lspci -mkv | grep -q 'Driver:[[:space:]]*nouveau'",
//             core::system::ProcessOptions(),
//             &result);

//    // don't log errors (assume that lspci failed or wasn't available
//    // and just bail on inference attempts)
//    if (error)
//       return QStringLiteral("auto");

//    // successful exit here implies that we found the nouveau driver
//    // is in use; in that case, we want to force software rendering
//    if (result.exitStatus == EXIT_SUCCESS)
//       return QStringLiteral("software");
// #endif

//    return QStringLiteral("auto");
// }

// #endif /* Q_OS_LINUX */

// QString inferDefaultRenderingEngine()
// {
// #if defined(Q_OS_WIN)
//    return inferDefaultRenderingEngineWindows();
// #elif defined(Q_OS_MAC)
//    return inferDefaultRenderingEngineMac();
// #elif defined(Q_OS_LINUX)
//    return inferDefaultRenderingEngineLinux();
// #else
//    return QStringLiteral("auto");
// #endif
// }

export function initializeRenderingEngine() {
  // Electron: Can add to command-line args for Chromium via app.commandLine.appendSwitch, etc.
  //
  //  QString engine = desktop::options().desktopRenderingEngine();
  //
  //  if (engine.isEmpty() || engine == QStringLiteral("auto")) {
  //    engine = inferDefaultRenderingEngine();
  //  }
  //
  //  if (engine == QStringLiteral("desktop")) {
  //    QCoreApplication::setAttribute(Qt::AA_UseDesktopOpenGL);
  //    QQuickWindow::setSceneGraphBackend(QSGRendererInterface::OpenGL);
  //  }
  //  else if (engine == QStringLiteral("gles")) {
  //    QCoreApplication::setAttribute(Qt::AA_UseOpenGLES);
  //    QQuickWindow::setSceneGraphBackend(QSGRendererInterface::OpenGL);
  //  }
  //  else if (engine == QStringLiteral("software")) {
  //    QCoreApplication::setAttribute(Qt::AA_UseSoftwareOpenGL);
  //    QQuickWindow::setSceneGraphBackend(QSGRendererInterface::Software);
  // 
  //    // allow WebGL rendering with the software renderer
  //    static char enableWebglSoftwareRendering[] = "--enable-webgl-software-rendering";
  //    pArguments->push_back(enableWebglSoftwareRendering);
  //  }
  //
  //  // tell Chromium to ignore the GPU blacklist if requested
  //  bool ignore = desktop::options().ignoreGpuBlacklist();
  //  if (ignore) {
  //    static char ignoreGpuBlacklist[] = "--ignore-gpu-blacklist";
  //    pArguments->push_back(ignoreGpuBlacklist);
  //  }
  //
  //  // also disable driver workarounds if requested
  //  bool disable = desktop::options().disableGpuDriverBugWorkarounds();
  //  if (disable) {
  //    static char disableGpuDriverBugWorkarounds[] = "--disable-gpu-driver-bug-workarounds";
  //    pArguments->push_back(disableGpuDriverBugWorkarounds);
  //  }
}
// boost::optional<SessionServer> getLaunchServerFromUrl(const std::string& url)
// {
//    auto iter = std::find_if(sessionServerSettings().servers().begin(),
//                             sessionServerSettings().servers().end(),
//                             [&](const SessionServer& server) { return server.url() == url; });

//    if (iter != sessionServerSettings().servers().end())
//    {
//       SessionServer server = *iter;
//       return boost::optional<SessionServer>(server);
//    }

//    return boost::optional<SessionServer>();
// }

// ProgramStatus initializeOptions(const QStringList& /*arguments*/)
// {
// #if DESKTOP_PRO
// ProgramStatus status = desktop::optionsPro().read(arguments);
// if (status.exit()) {
//   if (status.exitCode() == EXIT_FAILURE) {
//     QMessageBox errorMsg(safeMessageBoxIcon(QMessageBox::Critical),
//                          desktop::activation().editionName(),
//                          QStringLiteral("Error reading command-line arguments: %1 exiting")
//                              .arg(desktop::activation().editionName()));
//     errorMsg.addButton(QMessageBox::Close);
//     errorMsg.setWindowFlag(Qt::WindowContextHelpButtonHint, false);
//     errorMsg.exec();
//    }
// }
// return status;
// #else // OPEN_SOURCE
//    return ProgramStatus::run();
// }

export function getSessionServer(): string {
// #if DESKTOP_PRO
//   return desktop::optionsPro().getSessionServer();
// #else // OPEN_SOURCE
  return "";
}

export function getSessionUrl(): string {
// #if DESKTOP_PRO
//   return desktop::optionsPro().getSessionUrl();
// #else // OPEN_SOURCE
  return "";
}
