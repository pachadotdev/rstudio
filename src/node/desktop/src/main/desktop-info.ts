/*
 * desktop-info.ts
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


// /*
//  * DesktopInfo.hpp
//  *
//  * Copyright (C) 2021 by RStudio, PBC
//  *
//  * Unless you have received this program directly from RStudio pursuant
//  * to the terms of a commercial license agreement with RStudio, then
//  * this program is licensed to you under the terms of version 3 of the
//  * GNU Affero General Public License. This program is distributed WITHOUT
//  * ANY EXPRESS OR IMPLIED WARRANTY, INCLUDING THOSE OF NON-INFRINGEMENT,
//  * MERCHANTABILITY OR FITNESS FOR A PARTICULAR PURPOSE. Please refer to the
//  * AGPL (http://www.gnu.org/licenses/agpl-3.0.txt) for more details.
//  *
//  */

// #ifndef DESKTOP_DESKTOP_INFO_HPP
// #define DESKTOP_DESKTOP_INFO_HPP

// #include <QApplication>
// #include <QObject>
// #include <QString>

// #include "DesktopGwtCallback.hpp"

// namespace rstudio {
// namespace desktop {

// class DesktopInfo : public QObject
// {
//     Q_OBJECT

// Q_SIGNALS:
//    void fixedWidthFontListChanged(QString fontList);
//    void fixedWidthFontChanged(QString font);
//    void proportionalFontChanged(QString font);
//    void desktopSynctexViewerChanged(QString viewer);
//    void sumatraPdfExePathChanged(QString value);
//    void zoomLevelChanged(double value);
//    void chromiumDevtoolsPortChanged(quint16 value);

// public:
//    void onClose();

// public:
//    explicit DesktopInfo(QObject* parent = nullptr);

//    Q_INVOKABLE QString getPlatform();
//    Q_PROPERTY(QString platform
//               READ getPlatform
//               CONSTANT)

//    Q_INVOKABLE QString getVersion();
//    Q_PROPERTY(QString version
//               READ getVersion
//               CONSTANT)

//    Q_INVOKABLE QString getScrollingCompensationType();
//    Q_PROPERTY(QString scrollingCompensationType
//               READ getScrollingCompensationType
//               CONSTANT)

//    Q_INVOKABLE bool desktopHooksAvailable();
//    Q_PROPERTY(bool desktopHooksAvailable
//               READ desktopHooksAvailable
//               CONSTANT)

//    Q_INVOKABLE QString getFixedWidthFontList();
//    Q_INVOKABLE void setFixedWidthFontList(QString fontList);
//    Q_PROPERTY(QString fixedWidthFontList
//               READ getFixedWidthFontList
//               WRITE setFixedWidthFontList
//               NOTIFY fixedWidthFontListChanged)

//    Q_INVOKABLE QString getFixedWidthFont();
//    Q_INVOKABLE void setFixedWidthFont(QString font);
//    Q_PROPERTY(QString fixedWidthFont
//               READ getFixedWidthFont
//               WRITE setFixedWidthFont
//               NOTIFY fixedWidthFontChanged)

//    Q_INVOKABLE QString getProportionalFont();
//    Q_INVOKABLE void setProportionalFont(QString font);
//    Q_PROPERTY(QString proportionalFont
//               READ getProportionalFont
//               WRITE setProportionalFont
//               NOTIFY proportionalFontChanged)

//    Q_INVOKABLE QString getDesktopSynctexViewer();
//    Q_INVOKABLE void setDesktopSynctexViewer(QString viewer);
//    Q_PROPERTY(QString desktopSynctexViewer
//               READ getDesktopSynctexViewer
//               WRITE setDesktopSynctexViewer
//               NOTIFY desktopSynctexViewerChanged)

//    Q_INVOKABLE QString getSumatraPdfExePath();
//    Q_INVOKABLE void setSumatraPdfExePath(QString path);
//    Q_PROPERTY(QString sumatraPdfExePath
//               READ getSumatraPdfExePath
//               WRITE setSumatraPdfExePath
//               NOTIFY sumatraPdfExePathChanged)

//    Q_INVOKABLE double getZoomLevel();
//    Q_INVOKABLE void setZoomLevel(double zoomLevel);
//    Q_PROPERTY(double zoomLevel
//               READ getZoomLevel
//               WRITE setZoomLevel
//               NOTIFY zoomLevelChanged)
   
//    Q_INVOKABLE int getChromiumDevtoolsPort();
//    Q_INVOKABLE void setChromiumDevtoolsPort(int port);
//    Q_PROPERTY(int chromiumDevtoolsPort
//               READ getChromiumDevtoolsPort
//               WRITE setChromiumDevtoolsPort
//               NOTIFY chromiumDevtoolsPortChanged)
// };

// inline DesktopInfo& desktopInfo()
// {
//    static DesktopInfo* instance = new DesktopInfo(qApp);
//    return *instance;
// }

// } // end namespace desktop
// } // end namespace rstudio

// #endif /* DESKTOP_DESKTOP_INFO_HPP */


// /*
//  * DesktopInfo.cpp
//  *
//  * Copyright (C) 2021 by RStudio, PBC
//  *
//  * Unless you have received this program directly from RStudio pursuant
//  * to the terms of a commercial license agreement with RStudio, then
//  * this program is licensed to you under the terms of version 3 of the
//  * GNU Affero General Public License. This program is distributed WITHOUT
//  * ANY EXPRESS OR IMPLIED WARRANTY, INCLUDING THOSE OF NON-INFRINGEMENT,
//  * MERCHANTABILITY OR FITNESS FOR A PARTICULAR PURPOSE. Please refer to the
//  * AGPL (http://www.gnu.org/licenses/agpl-3.0.txt) for more details.
//  *
//  */

// #include "DesktopInfo.hpp"

// #include <atomic>
// #include <set>

// #include <boost/algorithm/string.hpp>

// #include <QThread>

// #include <core/Algorithm.hpp>
// #include <shared_core/SafeConvert.hpp>
// #include <core/system/Process.hpp>
// #include <core/system/Environment.hpp>
// #include <core/system/Process.hpp>
// #include <core/FileSerializer.hpp>

// #include "DesktopOptions.hpp"
// #include "DesktopSynctex.hpp"

// #define kLsbRelease    "/etc/lsb-release"
// #define kRedhatRelease "/etc/redhat-release"
// #define kOsRelease     "/etc/os-release"

// #define kUnknown QStringLiteral("(unknown)")

// using namespace rstudio::core;

// namespace rstudio {
// namespace desktop {

// namespace {

// #ifndef Q_OS_MAC
// std::atomic<bool> s_abortRequested(false);
// QThread* s_fontDatabaseWorker = nullptr;
// #endif

// QString s_platform             = kUnknown;
// QString s_version              = kUnknown;
// QString s_sumatraPdfExePath    = kUnknown;
// QString s_fixedWidthFontList   = QStringLiteral("");
// int     s_chromiumDevtoolsPort = -1;
// double  s_zoomLevel            = 1.0;

// #ifndef Q_OS_MAC

// void buildFontDatabaseImpl()
// {
//    QFontDatabase db;

//    QStringList fontList;
//    for (const QString& family : db.families())
//    {
//       if (s_abortRequested)
//          return;

// #ifdef _WIN32
//       // screen out annoying Qt warnings when attempting to
//       // initialize incompatible fonts
//       static std::set<std::string> blacklist = {
//          "8514oem",
//          "Fixedsys",
//          "Modern",
//          "MS Sans Serif",
//          "MS Serif",
//          "Roman",
//          "Script",
//          "Small Fonts",
//          "System",
//          "Terminal"
//       };

//       if (blacklist.count(family.toStdString()))
//          continue;
// #endif

//       if (isFixedWidthFont(QFont(family, 12)))
//          fontList.append(family);
//    }

//    QString fonts = fontList.join(QStringLiteral("\n"));

//    // NOTE: invokeMethod() is used to ensure thread-safe communication
//    QMetaObject::invokeMethod(
//             &desktopInfo(),
//             "setFixedWidthFontList",
//             Q_ARG(QString, fonts));
// }

// void buildFontDatabase()
// {
// #ifdef Q_OS_LINUX

//    if (desktop::options().useFontConfigDatabase())
//    {
//       // if fontconfig is installed, we can use it to query monospace
//       // fonts using its own cache (and it should be much more performant
//       // than asking Qt to build the font database on demand)
//       core::system::ProcessOptions options;
//       core::system::ProcessResult result;
//       Error error = core::system::runCommand(
//                "{ fc-list :mono -f '%{family}\n' & fc-list :dual -f '%{family}\n' & fc-list :charcell -f '%{family}\n'; } | cut -d ',' -f 1 | sort | uniq",
//                options,
//                &result);

//       bool didReturnFonts =
//             !error &&
//             result.exitStatus == EXIT_SUCCESS &&
//             !result.stdOut.empty();

//       if (didReturnFonts)
//       {
//          s_fixedWidthFontList = QString::fromStdString(result.stdOut);
//          return;
//       }
//    }

// #endif

//    s_fontDatabaseWorker = QThread::create(buildFontDatabaseImpl);
//    s_fontDatabaseWorker->start();
// }

// #else

// void buildFontDatabase()
// {
//    s_fixedWidthFontList = desktop::getFixedWidthFontList();
// }

// #endif

// #ifdef Q_OS_LINUX

// void readEntry(
//       const std::map<std::string, std::string>& entries,
//       const char* key,
//       QString* pOutput)
// {
//    if (entries.count(key))
//    {
//       *pOutput = QString::fromStdString(entries.at(key)).toLower();
//    }
// }

// void initializeLsbRelease()
// {
//    std::map<std::string, std::string> entries;
//    Error error = core::readStringMapFromFile(FilePath(kLsbRelease), &entries);

//    if (error)
//       LOG_ERROR(error);

//    readEntry(entries, "DISTRIB_ID", &s_platform);
//    readEntry(entries, "DISTRIB_RELEASE", &s_version);
// }

// void initializeRedhatRelease()
// {
//    std::string contents;
//    Error error = core::readStringFromFile(
//             FilePath(kRedhatRelease),
//             &contents);
//    if (error)
//       LOG_ERROR(error);

//    if (contents.find("CentOS") != std::string::npos)
//       s_platform = QStringLiteral("centos");
//    else if (contents.find("Red Hat Enterprise Linux"))
//       s_platform = QStringLiteral("rhel");
// }

// void initializeOsRelease()
// {
//    std::map<std::string, std::string> entries;
//    Error error = core::readStringMapFromFile(
//             FilePath(kOsRelease),
//             &entries);

//    if (error)
//       LOG_ERROR(error);

//    readEntry(entries, "ID", &s_platform);
//    readEntry(entries, "VERSION_ID", &s_version);
// }

// #endif /* Q_OS_LINUX */

// void initialize()
// {
//    buildFontDatabase();

// #ifdef Q_OS_LINUX
//    if (FilePath(kOsRelease).exists())
//    {
//       initializeOsRelease();
//       return;
//    }
   
//    if (FilePath(kLsbRelease).exists())
//    {
//       initializeLsbRelease();
//       return;
//    }

//    if (FilePath(kRedhatRelease).exists())
//    {
//       initializeRedhatRelease();
//       return;
//    }
// #endif
// }

// } // end anonymous namespace

// void DesktopInfo::onClose()
// {
// #ifndef Q_OS_MAC
//    if (s_fontDatabaseWorker && s_fontDatabaseWorker->isRunning())
//    {
//       s_abortRequested = true;
//       s_fontDatabaseWorker->wait(1000);
//    }
// #endif
// }

// DesktopInfo::DesktopInfo(QObject* parent)
//    : QObject(parent)
// {
//    initialize();
// }

// QString DesktopInfo::getPlatform()
// {
//    return s_platform;
// }

// QString DesktopInfo::getVersion()
// {
//    return s_version;
// }

// bool DesktopInfo::desktopHooksAvailable()
// {
//    return true;
// }

// QString DesktopInfo::getScrollingCompensationType()
// {
// #if defined(Q_OS_WIN32)
//    return QStringLiteral("Win");
// #elif defined(Q_OS_MAC)
//    return QStringLiteral("Mac");
// #else
//    return QStringLiteral("None");
// #endif
// }

// QString DesktopInfo::getFixedWidthFontList()
// {
//    return s_fixedWidthFontList;
// }

// void DesktopInfo::setFixedWidthFontList(QString fontList)
// {
//    if (s_fixedWidthFontList != fontList)
//    {
//       s_fixedWidthFontList = fontList;
//       emit fixedWidthFontListChanged(fontList);
//    }
// }

// QString DesktopInfo::getFixedWidthFont()
// {
//    return options().fixedWidthFont();
// }

// void DesktopInfo::setFixedWidthFont(QString font)
// {
//    if (font != options().fixedWidthFont())
//    {
//       options().setFixedWidthFont(font);
//       emit fixedWidthFontChanged(font);
//    }
// }

// QString DesktopInfo::getProportionalFont()
// {
//    return options().proportionalFont();
// }

// void DesktopInfo::setProportionalFont(QString font)
// {
//    if (font != options().proportionalFont())
//    {
//       options().setProportionalFont(font);
//       emit proportionalFontChanged(font);
//    }
// }

// QString DesktopInfo::getDesktopSynctexViewer()
// {
//    return Synctex::desktopViewerInfo().name;
// }

// void DesktopInfo::setDesktopSynctexViewer(QString)
// {
//    qWarning() << "setDesktopSynctexViewer() not implemented";
// }

// QString DesktopInfo::getSumatraPdfExePath()
// {
//    return s_sumatraPdfExePath;
// }

// void DesktopInfo::setSumatraPdfExePath(QString path)
// {
//    if (s_sumatraPdfExePath != path)
//    {
//       s_sumatraPdfExePath = path;
//       emit sumatraPdfExePathChanged(path);
//    }
// }

// double DesktopInfo::getZoomLevel()
// {
//    return s_zoomLevel;
// }

// void DesktopInfo::setZoomLevel(double zoomLevel)
// {
//    if (zoomLevel != s_zoomLevel)
//    {
//       s_zoomLevel = zoomLevel;
//       emit zoomLevelChanged(zoomLevel);
//    }
// }

// int DesktopInfo::getChromiumDevtoolsPort()
// {
//    return s_chromiumDevtoolsPort;
// }

// void DesktopInfo::setChromiumDevtoolsPort(int port)
// {
//    if (s_chromiumDevtoolsPort != port)
//    {
//       s_chromiumDevtoolsPort = port;
//       core::system::setenv("QT_WEBENGINE_REMOTE_DEBUGGING", safe_convert::numberToString(port));
//       emit chromiumDevtoolsPortChanged(port);
//    }
// }

// } // end namespace desktop
// } // end namespace rstudio
