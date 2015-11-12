/*
 * WorkbenchNewSession.java
 *
 * Copyright (C) 2009-12 by RStudio, Inc.
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

package org.rstudio.studio.client.workbench;

import org.rstudio.studio.client.RStudioGinjector;
import org.rstudio.studio.client.application.Desktop;
import org.rstudio.studio.client.application.model.ApplicationServerOperations;
import org.rstudio.studio.client.common.GlobalDisplay;

import com.google.inject.Inject;

public class WorkbenchNewSession
{
   public WorkbenchNewSession()
   {
      RStudioGinjector.INSTANCE.injectMembers(this);
   }
   
   @Inject
   public void initialize(GlobalDisplay globalDisplay,
                          WorkbenchContext workbenchContext,
                          ApplicationServerOperations server)
   {
      globalDisplay_ = globalDisplay;
      workbenchContext_ = workbenchContext;
      server_ = server;
   }
   
   public void openNewSession()
   {
      String project = workbenchContext_.getActiveProjectFile();
      if (project != null)
      {
         Desktop.getFrame().openProjectInNewWindow(project); 
      }
      else
      {
         Desktop.getFrame().openSessionInNewWindow(
               workbenchContext_.getCurrentWorkingDir().getPath());
      }
   }
   
   protected GlobalDisplay globalDisplay_;
   protected WorkbenchContext workbenchContext_;
   protected ApplicationServerOperations server_;

}
