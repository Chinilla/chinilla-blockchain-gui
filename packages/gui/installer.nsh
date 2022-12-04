!include "nsDialogs.nsh"

; Add our customizations to the finish page
!macro customFinishPage
XPStyle on

Var DetectDlg
Var FinishDlg
Var ChinillaSquirrelInstallLocation
Var ChinillaSquirrelInstallVersion
Var ChinillaSquirrelUninstaller
Var CheckboxUninstall
Var UninstallChinillaSquirrelInstall
Var BackButton
Var NextButton

Page custom detectOldChinillaVersion detectOldChinillaVersionPageLeave
Page custom finish finishLeave

; Add a page offering to uninstall an older build installed into the chinilla-blockchain dir
Function detectOldChinillaVersion
  ; Check the registry for old chinilla-blockchain installer keys
  ReadRegStr $ChinillaSquirrelInstallLocation HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\chinilla-blockchain" "InstallLocation"
  ReadRegStr $ChinillaSquirrelInstallVersion HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\chinilla-blockchain" "DisplayVersion"
  ReadRegStr $ChinillaSquirrelUninstaller HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\chinilla-blockchain" "QuietUninstallString"

  StrCpy $UninstallChinillaSquirrelInstall ${BST_UNCHECKED} ; Initialize to unchecked so that a silent install skips uninstalling

  ; If registry keys aren't found, skip (Abort) this page and move forward
  ${If} ChinillaSquirrelInstallVersion == error
  ${OrIf} ChinillaSquirrelInstallLocation == error
  ${OrIf} $ChinillaSquirrelUninstaller == error
  ${OrIf} $ChinillaSquirrelInstallVersion == ""
  ${OrIf} $ChinillaSquirrelInstallLocation == ""
  ${OrIf} $ChinillaSquirrelUninstaller == ""
  ${OrIf} ${Silent}
    Abort
  ${EndIf}

  ; Check the uninstall checkbox by default
  StrCpy $UninstallChinillaSquirrelInstall ${BST_CHECKED}

  ; Magic create dialog incantation
  nsDialogs::Create 1018
  Pop $DetectDlg

  ${If} $DetectDlg == error
    Abort
  ${EndIf}

  !insertmacro MUI_HEADER_TEXT "Uninstall Old Version" "Would you like to uninstall the old version of Chinilla Blockchain?"

  ${NSD_CreateLabel} 0 35 100% 12u "Found Chinilla Blockchain $ChinillaSquirrelInstallVersion installed in an old location:"
  ${NSD_CreateLabel} 12 57 100% 12u "$ChinillaSquirrelInstallLocation"

  ${NSD_CreateCheckBox} 12 81 100% 12u "Uninstall Chinilla Blockchain $ChinillaSquirrelInstallVersion"
  Pop $CheckboxUninstall
  ${NSD_SetState} $CheckboxUninstall $UninstallChinillaSquirrelInstall
  ${NSD_OnClick} $CheckboxUninstall SetUninstall

  nsDialogs::Show

FunctionEnd

Function SetUninstall
  ; Set UninstallChinillaSquirrelInstall accordingly
  ${NSD_GetState} $CheckboxUninstall $UninstallChinillaSquirrelInstall
FunctionEnd

Function detectOldChinillaVersionPageLeave
  ${If} $UninstallChinillaSquirrelInstall == 1
    ; This could be improved... Experiments with adding an indeterminate progress bar (PBM_SETMARQUEE)
    ; were unsatisfactory.
    ExecWait $ChinillaSquirrelUninstaller ; Blocks until complete (doesn't take long though)
  ${EndIf}
FunctionEnd

Function finish

  ; Magic create dialog incantation
  nsDialogs::Create 1018
  Pop $FinishDlg

  ${If} $FinishDlg == error
    Abort
  ${EndIf}

  GetDlgItem $NextButton $HWNDPARENT 1 ; 1 = Next button
  GetDlgItem $BackButton $HWNDPARENT 3 ; 3 = Back button

  ${NSD_CreateLabel} 0 35 100% 12u "Chinilla has been installed successfully!"
  EnableWindow $BackButton 0 ; Disable the Back button
  SendMessage $NextButton ${WM_SETTEXT} 0 "STR:Let's Farm!" ; Button title is "Close" by default. Update it here.

  nsDialogs::Show

FunctionEnd

; Copied from electron-builder NSIS templates
Function StartApp
  ${if} ${isUpdated}
    StrCpy $1 "--updated"
  ${else}
    StrCpy $1 ""
  ${endif}
  ${StdUtils.ExecShellAsUser} $0 "$launchLink" "open" "$1"
FunctionEnd

Function finishLeave
  ; Launch the app at exit
  Call StartApp
FunctionEnd

; Section
; SectionEnd
!macroend
