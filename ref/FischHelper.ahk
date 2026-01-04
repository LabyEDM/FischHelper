#SingleInstance Force
#NoEnv
#Persistent
setkeydelay, -1
setmousedelay, -1
setbatchlines, -1
SetTitleMatchMode 2

CoordMode, Tooltip, Relative
CoordMode, Pixel, Relative
CoordMode, Mouse, Relative

; ====================================================================================================
; FischHelper - In-Game Overlay with GitHub Integration
; ====================================================================================================

; Configuration
ConfigFile := A_ScriptDir . "\config.ini"
FishDataFile := A_ScriptDir . "\fishdata.json"
RodDataFile := A_ScriptDir . "\roddata.json"
GitHubRepo := "LabyEDM/fischhelper"  ; Update with your GitHub repo
GitHubRawBase := ""  ; Will be set after loading config

; State Variables
OverlayActive := false
SearchOpen := false
RobloxDetected := false
CurrentWindowWidth := 0
CurrentWindowHeight := 0

; Rod Stats
BaseControl := 0
BasePower := 0
BaseSpeed := 0
BaseDurability := 0
BaseLuck := 0
WeatherType := "None"
PotType := "None"
FriendBonus := 0

; Fish Database
FishDatabase := Object()

; ====================================================================================================
; INITIALIZATION
; ====================================================================================================

; Load configuration
Gosub, LoadConfig

; Set GitHub base URL
GitHubRawBase := "https://raw.githubusercontent.com/" . GitHubRepo . "/main/data/"

; Check for updates from GitHub
Gosub, CheckGitHubUpdates

; Start Roblox detection loop
SetTimer, DetectRoblox, 1000
Gosub, DetectRoblox

; Create minimal settings GUI (hidden by default)
Gosub, CreateSettingsGUI

Return

; ====================================================================================================
; ROBOX DETECTION
; ====================================================================================================

DetectRoblox:
    if (WinExist("ahk_exe RobloxPlayerBeta.exe") || WinExist("ahk_exe eurotruck2.exe"))
    {
        if (!RobloxDetected)
        {
            RobloxDetected := true
            WinActivate, Roblox
            Sleep, 500
            Gosub, InitializeOverlay
        }
        
        ; Keep window active
        if (!WinActive("ahk_exe RobloxPlayerBeta.exe") && !WinActive("ahk_exe eurotruck2.exe"))
        {
            WinActivate
        }
    }
    else
    {
        if (RobloxDetected)
        {
            RobloxDetected := false
            OverlayActive := false
            Gosub, CloseOverlays
        }
}
Return

InitializeOverlay:
    if (A_ScreenDPI != 96)
    {
        ; Warn user but don't exit
        ToolTip, Warning: Display Scale is not 100%`nSome features may not work correctly, A_ScreenWidth/2, 50
        SetTimer, RemoveToolTip, 5000
    }
    
    WinGetActiveStats, Title, WindowWidth, WindowHeight, WindowLeft, WindowTop
    CurrentWindowWidth := WindowWidth
    CurrentWindowHeight := WindowHeight
    
    ; Create rod stats overlay (bottom left)
    Gosub, CreateRodStatsOverlay
    
    ; Initialize fish search (hidden until keybind)
    Gosub, CreateFishSearchOverlay
    
    OverlayActive := true
    Gosub, UpdateRodStatsDisplay
    
    ToolTip, FischHelper Active - Press F1 for Fish Search, A_ScreenWidth/2, 50
    SetTimer, RemoveToolTip, 3000
Return

RemoveToolTip:
    ToolTip
    SetTimer, RemoveToolTip, Off
Return

; ====================================================================================================
; ROD STATS OVERLAY (Bottom Left)
; ====================================================================================================

CreateRodStatsOverlay:
    ; Calculate position (bottom left, next to friend bonus XP area)
    WinGetActiveStats, , WindowWidth, WindowHeight
    StatsX := 20
    StatsY := WindowHeight - 200
    if (StatsY < 0)
        StatsY := 50
    
    Gui, Stats:+AlwaysOnTop -Caption +ToolWindow +LastFound
    Gui, Stats:Color, 000000
    WinSet, Transparent, 200
    Gui, Stats:Font, s10 cFFFFFF, Arial
    Gui, Stats:Add, Text, x10 y10 w300 vStatsText, Loading...
    Gui, Stats:Show, x%StatsX% y%StatsY% w320 h180 NoActivate
Return

UpdateRodStatsDisplay:
    if (!OverlayActive)
        return
    
    ; Calculate final stats
    WeatherMultiplier := 1.0
    if (WeatherType = "Rain")
        WeatherMultiplier := 1.15
    else if (WeatherType = "Sun")
        WeatherMultiplier := 1.10
    else if (WeatherType = "Storm")
        WeatherMultiplier := 1.25
    else if (WeatherType = "Fog")
        WeatherMultiplier := 0.95
    
    PotMultiplier := 1.0
    if (PotType = "Power Pot")
        PotMultiplier := 1.20
    else if (PotType = "Speed Pot")
        PotMultiplier := 1.15
    else if (PotType = "Control Pot")
        PotMultiplier := 1.25
    else if (PotType = "Durability Pot")
        PotMultiplier := 1.30
    else if (PotType = "Luck Pot")
        PotMultiplier := 1.35
    
    FinalControl := Round(BaseControl * WeatherMultiplier * (PotType = "Control Pot" ? PotMultiplier : 1.0), 2)
    FinalPower := Round(BasePower * WeatherMultiplier * (PotType = "Power Pot" ? PotMultiplier : 1.0), 2)
    FinalSpeed := Round(BaseSpeed * WeatherMultiplier * (PotType = "Speed Pot" ? PotMultiplier : 1.0), 2)
    FinalDurability := Round(BaseDurability * WeatherMultiplier * (PotType = "Durability Pot" ? PotMultiplier : 1.0), 2)
    FinalLuck := Round(BaseLuck * WeatherMultiplier * (PotType = "Luck Pot" ? PotMultiplier : 1.0), 2)
    
    ; Build display text
    StatsText := "=== Rod Stats ===" . "`n"
    StatsText .= "Control: " . FinalControl . "`n"
    StatsText .= "Power: " . FinalPower . "`n"
    StatsText .= "Speed: " . FinalSpeed . "`n"
    StatsText .= "Durability: " . FinalDurability . "`n"
    StatsText .= "Luck: " . FinalLuck . "`n"
    StatsText .= "Friend Bonus: " . FriendBonus . "%`n"
    StatsText .= "Weather: " . WeatherType . "`n"
    StatsText .= "Pot: " . PotType
    
    GuiControl, Stats:, StatsText, %StatsText%
Return

; ====================================================================================================
; FISH SEARCH OVERLAY (Right Side)
; ====================================================================================================

CreateFishSearchOverlay:
    WinGetActiveStats, , WindowWidth
    SearchX := WindowWidth - 420
    if (SearchX < 0)
        SearchX := 50
    SearchY := 50
    
    Gui, Search:+AlwaysOnTop -Caption +ToolWindow +LastFound
    Gui, Search:Color, 1a1a1a
    WinSet, Transparent, 240
    Gui, Search:Font, s12 cFFFFFF Bold, Arial
    Gui, Search:Add, Text, x10 y10 w380, FischPedia
    Gui, Search:Font, s10 Norm
    Gui, Search:Add, Edit, x10 y40 w380 h30 vSearchInput gSearchFish, 
    Gui, Search:Add, ListBox, x10 y80 w380 h400 vFishListBox gSelectFish
    Gui, Search:Add, Edit, x10 y490 w380 h150 ReadOnly vFishInfo
    Gui, Search:Font, s8
    Gui, Search:Add, Text, x10 y650 w380, Press F1 to toggle | ESC to close
Return

ToggleFishSearch:
    if (!OverlayActive)
        return
    
    SearchOpen := !SearchOpen
    if (SearchOpen)
    {
        Gui, Search:Show, x%SearchX% y%SearchY% w400 h680 NoActivate
        Gosub, PopulateFishList
        GuiControl, Search:Focus, SearchInput
	}
else
	{
        Gui, Search:Hide
    }
Return

SearchFish:
    Gui, Submit, NoHide
    GuiControlGet, SearchTerm,, SearchInput
    
    GuiControl,, FishListBox, |  ; Clear list
    
    if (SearchTerm = "")
    {
        Gosub, PopulateFishList
        return
    }
    
    ; Filter fish by search term
    for fishName, fishData in FishDatabase
    {
        if (InStr(fishName, SearchTerm) || InStr(fishData.name, SearchTerm) || InStr(fishData.location, SearchTerm))
        {
            GuiControl,, FishListBox, %fishName%
        }
    }
Return

PopulateFishList:
    GuiControl,, FishListBox, |  ; Clear list
    for fishName, fishData in FishDatabase
    {
        GuiControl,, FishListBox, %fishName%
    }
Return

SelectFish:
    Gui, Submit, NoHide
    GuiControlGet, SelectedFish,, FishListBox
    
    if (SelectedFish != "" && FishDatabase.HasKey(SelectedFish))
    {
        fishData := FishDatabase[SelectedFish]
        infoText := "Name: " . fishData.name . "`n"
        infoText .= "Rarity: " . fishData.rarity . "`n"
        infoText .= "Location: " . fishData.location . "`n"
        infoText .= "Base Value: " . fishData.value . "`n"
        infoText .= "Power Required: " . fishData.powerRequired . "`n"
        infoText .= "Speed: " . fishData.speed . "`n"
        infoText .= "Control Needed: " . fishData.controlNeeded . "`n"
        if (fishData.notes)
            infoText .= "Notes: " . fishData.notes . "`n"
        if (fishData.bestTime)
            infoText .= "Best Time: " . fishData.bestTime . "`n"
        
        GuiControl,, FishInfo, %infoText%
    }
Return

; ====================================================================================================
; GITHUB INTEGRATION
; ====================================================================================================

CheckGitHubUpdates:
    ; Update GitHubRawBase with current repo if not set
    if (GitHubRawBase = "")
        GitHubRawBase := "https://raw.githubusercontent.com/" . GitHubRepo . "/main/data/"
    
    ToolTip, Checking for updates from GitHub..., A_ScreenWidth/2, A_ScreenHeight/2
    
    ; Download fish data
    FishDataURL := GitHubRawBase . "fishdata.json"
    TempFile := FishDataFile . ".tmp"
    FileDelete, %TempFile%
    
    try
    {
        UrlDownloadToFile, %FishDataURL%, %TempFile%
        Sleep, 500
        
        if (FileExist(TempFile))
        {
            FileGetSize, FileSize, %TempFile%
            if (FileSize > 0)
            {
                FileCopy, %TempFile%, %FishDataFile%, 1
                FileDelete, %TempFile%
                Gosub, LoadFishData
                ToolTip, Fish data updated from GitHub!, A_ScreenWidth/2, A_ScreenHeight/2
                SetTimer, RemoveToolTip, 2000
                return
            }
        }
    }
    
    ; Use local data if GitHub fails
    if (FileExist(FishDataFile))
    {
        Gosub, LoadFishData
        ToolTip, Using local fish data, A_ScreenWidth/2, A_ScreenHeight/2
    }
    else
    {
        Gosub, LoadDefaultFishData
        ToolTip, Using default fish data, A_ScreenWidth/2, A_ScreenHeight/2
    }
    
    SetTimer, RemoveToolTip, 2000
Return

LoadFishData:
    ; Simple parser for fish data
    ; Format: fishname|rarity|location|value|powerRequired|speed|controlNeeded|notes|bestTime
    FishDatabase := Object()
    
    if (!FileExist(FishDataFile))
    {
        Gosub, LoadDefaultFishData
        return
    }
    
    FileRead, FishDataContent, %FishDataFile%
    if (ErrorLevel)
    {
        Gosub, LoadDefaultFishData
        return
    }
    
    ; Parse the data
    Loop, Parse, FishDataContent, `n, `r
    {
        Line := Trim(A_LoopField)
        if (Line = "" || InStr(Line, "//") = 1)
            continue
        
        StringSplit, Fields, Line, |
        if (Fields0 >= 6)
        {
            fishName := Trim(Fields1)
            FishDatabase[fishName] := Object()
            FishDatabase[fishName].name := fishName
            FishDatabase[fishName].rarity := Trim(Fields2)
            FishDatabase[fishName].location := Trim(Fields3)
            FishDatabase[fishName].value := Trim(Fields4)
            FishDatabase[fishName].powerRequired := Trim(Fields5)
            FishDatabase[fishName].speed := Trim(Fields6)
            FishDatabase[fishName].controlNeeded := Fields7 ? Trim(Fields7) : "N/A"
            FishDatabase[fishName].notes := Fields8 ? Trim(Fields8) : ""
            FishDatabase[fishName].bestTime := Fields9 ? Trim(Fields9) : ""
        }
    }
    
    ; If no fish loaded, use defaults
    if (FishDatabase.Count() = 0)
    {
        Gosub, LoadDefaultFishData
    }
Return

LoadDefaultFishData:
    ; Default fish database
    FishDatabase := Object()
    
    FishDatabase["Common Carp"] := Object()
    FishDatabase["Common Carp"].name := "Common Carp"
    FishDatabase["Common Carp"].rarity := "Common"
    FishDatabase["Common Carp"].location := "Freshwater"
    FishDatabase["Common Carp"].value := 10
    FishDatabase["Common Carp"].powerRequired := 5
    FishDatabase["Common Carp"].speed := "Slow"
    FishDatabase["Common Carp"].controlNeeded := 3
    FishDatabase["Common Carp"].notes := "Found in most freshwater areas"
    
    FishDatabase["Bass"] := Object()
    FishDatabase["Bass"].name := "Bass"
    FishDatabase["Bass"].rarity := "Common"
    FishDatabase["Bass"].location := "Freshwater"
    FishDatabase["Bass"].value := 15
    FishDatabase["Bass"].powerRequired := 8
    FishDatabase["Bass"].speed := "Medium"
    FishDatabase["Bass"].controlNeeded := 5
    FishDatabase["Bass"].notes := "Common in lakes and rivers"
    
    FishDatabase["Salmon"] := Object()
    FishDatabase["Salmon"].name := "Salmon"
    FishDatabase["Salmon"].rarity := "Uncommon"
    FishDatabase["Salmon"].location := "Freshwater"
    FishDatabase["Salmon"].value := 25
    FishDatabase["Salmon"].powerRequired := 12
    FishDatabase["Salmon"].speed := "Fast"
    FishDatabase["Salmon"].controlNeeded := 8
    FishDatabase["Salmon"].notes := "Found in rivers, requires good control"
    
    FishDatabase["Tuna"] := Object()
    FishDatabase["Tuna"].name := "Tuna"
    FishDatabase["Tuna"].rarity := "Rare"
    FishDatabase["Tuna"].location := "Ocean"
    FishDatabase["Tuna"].value := 50
    FishDatabase["Tuna"].powerRequired := 25
    FishDatabase["Tuna"].speed := "Very Fast"
    FishDatabase["Tuna"].controlNeeded := 15
    FishDatabase["Tuna"].notes := "Deep ocean fish, requires high stats"
    
    FishDatabase["Shark"] := Object()
    FishDatabase["Shark"].name := "Shark"
    FishDatabase["Shark"].rarity := "Epic"
    FishDatabase["Shark"].location := "Ocean"
    FishDatabase["Shark"].value := 100
    FishDatabase["Shark"].powerRequired := 50
    FishDatabase["Shark"].speed := "Very Fast"
    FishDatabase["Shark"].controlNeeded := 30
    FishDatabase["Shark"].notes := "Dangerous, requires maxed rod stats"
Return

; ====================================================================================================
; SETTINGS GUI
; ====================================================================================================

CreateSettingsGUI:
    Gui, Settings:+AlwaysOnTop
    Gui, Settings:Add, Tab2, w600 h500, Rod Stats|Settings
    
    ; Rod Stats Tab
    Gui, Settings:Tab, Rod Stats
    Gui, Settings:Add, Text, x30 y40, Base Control:
    Gui, Settings:Add, Edit, x150 y40 w100 vBaseControl, %BaseControl%
    Gui, Settings:Add, Text, x30 y80, Base Power:
    Gui, Settings:Add, Edit, x150 y80 w100 vBasePower, %BasePower%
    Gui, Settings:Add, Text, x30 y120, Base Speed:
    Gui, Settings:Add, Edit, x150 y120 w100 vBaseSpeed, %BaseSpeed%
    Gui, Settings:Add, Text, x30 y160, Base Durability:
    Gui, Settings:Add, Edit, x150 y160 w100 vBaseDurability, %BaseDurability%
    Gui, Settings:Add, Text, x30 y200, Base Luck:
    Gui, Settings:Add, Edit, x150 y200 w100 vBaseLuck, %BaseLuck%
    Gui, Settings:Add, Text, x30 y240, Friend Bonus:
    Gui, Settings:Add, Edit, x150 y240 w100 vFriendBonus, %FriendBonus%
    
    Gui, Settings:Add, Text, x300 y40, Weather:
    Gui, Settings:Add, ComboBox, x300 y70 w150 vWeatherType, None|Rain|Sun|Storm|Fog
    GuiControl, Settings:ChooseString, WeatherType, %WeatherType%
    
    Gui, Settings:Add, Text, x300 y120, Pot Type:
    Gui, Settings:Add, ComboBox, x300 y150 w150 vPotType, None|Power Pot|Speed Pot|Control Pot|Durability Pot|Luck Pot
    GuiControl, Settings:ChooseString, PotType, %PotType%
    
    Gui, Settings:Add, Button, x200 y450 w100 h30 gSaveConfig, Save & Close
    
    ; Settings Tab
    Gui, Settings:Tab, Settings
    Gui, Settings:Add, Text, x30 y40, GitHub Repository:
    Gui, Settings:Add, Edit, x30 y70 w400 vGitHubRepo, %GitHubRepo%
    Gui, Settings:Add, Button, x30 y110 w150 h30 gCheckGitHubUpdates, Check for Updates
    Gui, Settings:Add, Text, x30 y160, Hotkeys:
    Gui, Settings:Add, Text, x30 y190, F1 - Toggle Fish Search
    Gui, Settings:Add, Text, x30 y220, F2 - Open Settings
    Gui, Settings:Add, Text, x30 y250, ESC - Close Search
    
Return

ShowSettings:
    Gui, Settings:Show, w620 h520, FischHelper Settings
Return

SaveConfig:
    Gui, Settings:Submit
    
    ; Save to config file
    IniWrite, %BaseControl%, %ConfigFile%, RodStats, BaseControl
    IniWrite, %BasePower%, %ConfigFile%, RodStats, BasePower
    IniWrite, %BaseSpeed%, %ConfigFile%, RodStats, BaseSpeed
    IniWrite, %BaseDurability%, %ConfigFile%, RodStats, BaseDurability
    IniWrite, %BaseLuck%, %ConfigFile%, RodStats, BaseLuck
    IniWrite, %FriendBonus%, %ConfigFile%, RodStats, FriendBonus
    IniWrite, %WeatherType%, %ConfigFile%, RodStats, WeatherType
    IniWrite, %PotType%, %ConfigFile%, RodStats, PotType
    IniWrite, %GitHubRepo%, %ConfigFile%, Settings, GitHubRepo
    
    Gosub, UpdateRodStatsDisplay
    Gui, Settings:Hide
Return

LoadConfig:
    IniRead, BaseControl, %ConfigFile%, RodStats, BaseControl, 0
    IniRead, BasePower, %ConfigFile%, RodStats, BasePower, 0
    IniRead, BaseSpeed, %ConfigFile%, RodStats, BaseSpeed, 0
    IniRead, BaseDurability, %ConfigFile%, RodStats, BaseDurability, 0
    IniRead, BaseLuck, %ConfigFile%, RodStats, BaseLuck, 0
    IniRead, FriendBonus, %ConfigFile%, RodStats, FriendBonus, 0
    IniRead, WeatherType, %ConfigFile%, RodStats, WeatherType, None
    IniRead, PotType, %ConfigFile%, RodStats, PotType, None
    IniRead, GitHubRepo, %ConfigFile%, Settings, GitHubRepo, yourusername/fischhelper
Return

; ====================================================================================================
; HOTKEYS
; ====================================================================================================

#If (RobloxDetected && !WinActive("ahk_class AutoHotkeyGUI"))
F1::Gosub, ToggleFishSearch
F2::Gosub, ShowSettings
#If

#If (SearchOpen)
Esc::
    SearchOpen := false
    Gui, Search:Hide
Return
#If

; ====================================================================================================
; CLEANUP
; ====================================================================================================

CloseOverlays:
    Gui, Stats:Hide
    Gui, Search:Hide
Return

ExitApp:
    Gosub, CloseOverlays
    ExitApp

GuiClose:
    if (A_Gui = "Settings")
    {
        Gui, Settings:Hide
	}
else
	{
        ExitApp
    }
Return
