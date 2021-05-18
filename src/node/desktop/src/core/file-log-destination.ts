/*
 * file-log-destination.ts
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

 /**
  * @brief Class which allows sending log messages to a file.
  */
 class FileLogDestination : public ILogDestination
 {
 public:
    /**
     * @brief Constructor.
     *
     * @param in_id              The ID of this log destination. Must be unique for each file log destination and > 100.
     * @param in_logLevel        The most detailed level of log to be written to this log file.
     * @param in_programId       The ID of this program.
     * @param in_logOptions      The options for log file creation and management.
     *
     * If the log file cannot be opened, no logs will be written to the file. If there are other log destinations
     * registered an error will be logged regarding the failure.
     */
    FileLogDestination(
       unsigned int in_id,
       LogLevel in_logLevel,
       const std::string& in_programId,
       FileLogOptions in_logOptions);
 
    /**
     * @brief Destructor.
     */
    ~FileLogDestination() override;
 
    /**
     * @brief Gets the unique ID of this file log destination.
     *
     * @return The unique ID of this file log destination.
     */
    unsigned int getId() const override;
 
    /**
     * @brief Reloads the log destintation. Ensures that the log does not have any stale file handles.
     */
    void reload() override;
 
    bool isFileLogger() const override;
 
    /**
     * @brief Writes a message to the log file.
     *
     * @param in_logLevel    The log level of the message to write. Filtering is done prior to this call. This is for
     *                       informational purposes only.
     * @param in_message     The message to write to the log file.
     */
    void writeLog(LogLevel in_logLevel, const std::string& in_message) override;
 
 private:
    PRIVATE_IMPL_SHARED(m_impl);
 };
 