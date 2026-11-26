<#
  build-cv.ps1: rebuilds the CV PDF from tools/cv/cv-source.html using Microsoft Edge.

  Public CV (no phone number, used by the website):
      .\tools\build-cv.ps1

  Also build a private CV with your phone number (saved OUTSIDE the repo, in Documents):
      .\tools\build-cv.ps1 -Phone "+91-XXXXXXXXXX"

  Your phone number is never written into the repository.
#>
param(
  [string]$Phone = "",
  [string]$PrivateOut = (Join-Path ([Environment]::GetFolderPath('MyDocuments')) 'Abhoy_Mallik_Flutter_CV.pdf')
)
$ErrorActionPreference = 'Stop'

$repo   = Split-Path -Parent $PSScriptRoot
$source = Join-Path $PSScriptRoot 'cv\cv-source.html'
$public = Join-Path $repo 'assets\cv\Abhoy_Mallik_CV.pdf'

$edge = @(
  "${env:ProgramFiles(x86)}\Microsoft\Edge\Application\msedge.exe",
  "$env:ProgramFiles\Microsoft\Edge\Application\msedge.exe"
) | Where-Object { Test-Path $_ } | Select-Object -First 1
if (-not $edge) { throw 'Microsoft Edge was not found. It is needed to print the CV to PDF.' }

$work = Join-Path $env:TEMP 'portfolio-cv-build'
New-Item -ItemType Directory -Force -Path $work | Out-Null
$html = [IO.File]::ReadAllText($source, [Text.Encoding]::UTF8)

function Build-Pdf([string]$phoneHtml, [string]$outFile) {
  $tmpHtml = Join-Path $work ('cv-' + [guid]::NewGuid().ToString('N') + '.html')
  [IO.File]::WriteAllText($tmpHtml, $html.Replace('{{PHONE}}', $phoneHtml), (New-Object Text.UTF8Encoding $false))
  New-Item -ItemType Directory -Force -Path (Split-Path -Parent $outFile) | Out-Null
  $url = 'file:///' + $tmpHtml.Replace('\', '/')
  $edgeArgs = @(
    '--headless=new', '--disable-gpu', '--no-pdf-header-footer',
    ('"--user-data-dir=' + (Join-Path $work 'edge-profile') + '"'),
    ('"--print-to-pdf=' + $outFile + '"'),
    ('"' + $url + '"')
  )
  Start-Process -FilePath $edge -ArgumentList $edgeArgs -Wait -WindowStyle Hidden
  Remove-Item $tmpHtml -Force
  if (-not (Test-Path $outFile)) { throw "PDF was not created: $outFile" }
  Write-Host "Created $outFile"
}

Build-Pdf '' $public
if ($Phone) {
  $safe = [Net.WebUtility]::HtmlEncode($Phone)
  Build-Pdf "<span>$safe</span>" $PrivateOut
}
Write-Host 'Done. Open the PDFs and check they still fit on one page.'
