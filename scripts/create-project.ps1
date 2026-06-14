<#
.SYNOPSIS
Creates a new design-token project, creates a GitHub repository with gh, pushes the project, and optionally enables GitHub Pages.

.REQUIREMENTS
- Git
- GitHub CLI: gh auth login
- Node.js / npm

.EXAMPLE
.\scripts\create-project.ps1 `
  -ProjectName "Project" `
  -GithubOwner "jkrakisis" `
  -GithubRepo "project" `
  -FigmaUrl "https://www.figma.com/design/..."
#>

[CmdletBinding()]
param(
  [Parameter(Mandatory = $true)]
  [string]$ProjectName,

  [Parameter(Mandatory = $true)]
  [string]$GithubOwner,

  [string]$GithubRepo = $ProjectName,

  [string]$FigmaUrl = "",

  [string]$DestinationRoot = "D:\design_workflow",

  [ValidateSet("public", "private")]
  [string]$Visibility = "public",

  [switch]$SkipInstall,

  [switch]$SkipPages,

  [switch]$NoPush,

  [switch]$Force
)

$ErrorActionPreference = "Stop"

function Assert-Command($Name) {
  if (-not (Get-Command $Name -ErrorAction SilentlyContinue)) {
    throw "Required command not found: $Name"
  }
}

function ConvertTo-PackageName($Name) {
  $slug = $Name.ToLowerInvariant() -replace '[^a-z0-9]+', '-'
  $slug = $slug.Trim('-')
  if ([string]::IsNullOrWhiteSpace($slug)) {
    throw "ProjectName must contain at least one letter or number."
  }
  return $slug
}

function Get-FigmaInfo($Url) {
  $info = [ordered]@{
    url = $Url
    fileKey = ""
    nodeId = ""
  }

  if ([string]::IsNullOrWhiteSpace($Url)) {
    return $info
  }

  if ($Url -match 'figma\.com/(?:design|file)/([^/\?]+)') {
    $info.fileKey = $Matches[1]
  }

  if ($Url -match 'node-id=([^&]+)') {
    $info.nodeId = [Uri]::UnescapeDataString($Matches[1]).Replace('-', ':')
  }

  return $info
}

Assert-Command git
Assert-Command npm
Assert-Command gh

& gh auth status | Out-Null
if ($LASTEXITCODE -ne 0) {
  throw "GitHub CLI is not logged in. Run: gh auth login"
}
$packageName = ConvertTo-PackageName $GithubRepo
$sourceRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$targetRoot = Join-Path $DestinationRoot $GithubRepo

if ((Test-Path $targetRoot) -and -not $Force) {
  throw "Target folder already exists: $targetRoot. Use -Force only after reviewing the existing folder."
}

if (-not (Test-Path $DestinationRoot)) {
  New-Item -ItemType Directory -Force -Path $DestinationRoot | Out-Null
}

if (-not (Test-Path $targetRoot)) {
  New-Item -ItemType Directory -Force -Path $targetRoot | Out-Null
}

Write-Host "Creating project folder: $targetRoot"

$excludeDirs = @('.git', 'node_modules', 'scripts')
$excludeFiles = @('prototype\desktop.png', 'prototype\mobile.png')

Get-ChildItem -LiteralPath $sourceRoot -Force | ForEach-Object {
  if (-not ($excludeDirs -contains $_.Name)) {
    $destination = Join-Path $targetRoot $_.Name
    if ($_.PSIsContainer) {
      Copy-Item -LiteralPath $_.FullName -Destination $destination -Recurse -Force
    } else {
      Copy-Item -LiteralPath $_.FullName -Destination $destination -Force
    }
  }
}

foreach ($relativeFile in $excludeFiles) {
  $file = Join-Path $targetRoot $relativeFile
  if (Test-Path $file) {
    Remove-Item -LiteralPath $file -Force
  }
}

$packagePath = Join-Path $targetRoot 'package.json'
if (Test-Path $packagePath) {
  $package = Get-Content -LiteralPath $packagePath -Raw | ConvertFrom-Json
  $package.name = $packageName
  $package.description = "$ProjectName Design System Tokens"
  $package | ConvertTo-Json -Depth 20 | Set-Content -LiteralPath $packagePath -Encoding UTF8
}

$pagesUrl = "https://$GithubOwner.github.io/$GithubRepo/prototype/"
$repoUrl = "https://github.com/$GithubOwner/$GithubRepo"
$figmaInfo = Get-FigmaInfo $FigmaUrl
$figmaLine = if ([string]::IsNullOrWhiteSpace($FigmaUrl)) { "" } else { "`n- Figma reference: Project" }
if ([string]::IsNullOrWhiteSpace($FigmaUrl)) {
  $figmaMeta = ""
} else {
  $figmaMeta = @"

## Figma Reference

~~~text
URL: $($figmaInfo.url)
File key: $($figmaInfo.fileKey)
Node ID: $($figmaInfo.nodeId)
~~~
"@
}

$readmePath = Join-Path $targetRoot 'README.md'
@"
# Design System Tokens

Figma Project에서 추출한 디자인 시스템 토큰과, 해당 토큰을 적용한 정적 HTML/CSS 프로토타입을 관리하는 저장소입니다.$figmaLine

- GitHub repository: [$GithubOwner/$GithubRepo]($repoUrl)
- GitHub Pages: [$pagesUrl]($pagesUrl)

> GitHub Pages URL은 repository Settings > Pages에서 main branch / root 배포가 활성화된 뒤 확인할 수 있습니다.

## Project Structure

~~~text
.
├─ tokens.json
├─ sd.config.js
├─ tokens.css
├─ tokens.scss
├─ package.json
└─ prototype/
   ├─ index.html
   ├─ styles.css
   └─ assets/
~~~

## Setup

~~~bash
npm install
~~~

## Build Tokens

~~~bash
npm run build-tokens
~~~

개발 중 토큰 변경을 감시하려면 아래 명령을 사용할 수 있습니다.

~~~bash
npm run watch-tokens
~~~

## Prototype

로컬에서 바로 열기:

~~~text
$targetRoot\prototype\index.html
~~~

배포 후 확인 URL:

~~~text
$pagesUrl
~~~
$figmaMeta
## Git Workflow

~~~bash
git status
git add .
git commit -m "Update design tokens"
git push
~~~

## Notes

- tokens.css, tokens.scss는 생성 파일이므로 직접 수정하기보다 tokens.json 또는 sd.config.js를 수정한 뒤 다시 빌드하는 것을 권장합니다.
- prototype/desktop.png, prototype/mobile.png는 로컬 화면 검수용 캡처 파일이며 Git에는 포함하지 않습니다.
"@ | Set-Content -LiteralPath $readmePath -Encoding UTF8

$figmaMetaPath = Join-Path $targetRoot 'figma-source.json'
$figmaInfo | ConvertTo-Json -Depth 5 | Set-Content -LiteralPath $figmaMetaPath -Encoding UTF8

Push-Location $targetRoot
try {
  if (-not $SkipInstall) {
    Write-Host "Installing dependencies..."
    npm install
  }

  if (Test-Path (Join-Path $targetRoot 'sd.config.js')) {
    Write-Host "Building tokens..."
    npm run build-tokens
  }

  Write-Host "Initializing Git repository..."
  git init
  git branch -M main
  git add .
  git commit -m "Initial design token project"

  Write-Host "Creating GitHub repository: $GithubOwner/$GithubRepo"
  $visibilityFlag = if ($Visibility -eq 'private') { '--private' } else { '--public' }
  gh repo create "$GithubOwner/$GithubRepo" $visibilityFlag --source . --remote origin

  if (-not $NoPush) {
    Write-Host "Pushing to GitHub..."
    git push -u origin main
  }

  if (-not $SkipPages -and -not $NoPush) {
    Write-Host "Enabling GitHub Pages..."
    try {
      gh api --method POST "repos/$GithubOwner/$GithubRepo/pages" -f "source[branch]=main" -f "source[path]=/" | Out-Null
    } catch {
      Write-Warning "GitHub Pages may already be enabled or may need manual setup: $($_.Exception.Message)"
    }
  }
}
finally {
  Pop-Location
}

Write-Host ""
Write-Host "Done."
Write-Host "Repository: $repoUrl"
Write-Host "Prototype:   $pagesUrl"
Write-Host "Local path:  $targetRoot"





