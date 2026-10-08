import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const config=fileURLToPath(new URL('../.local/mysql/my.ini',import.meta.url));
const executable='C:\\mysql\\mysql-commercial-9.7.0-winx64\\bin\\mysqld.exe';
const quote=s=>"'"+s.replaceAll("'","''")+"'";
const command=`$ErrorActionPreference='Stop'; $cargoServiceInstaller = Start-Process -FilePath ${quote(executable)} -ArgumentList ${quote('--install CargoASLMySQL "--defaults-file='+config+'"')} -Verb RunAs -WindowStyle Hidden -Wait -PassThru; exit $cargoServiceInstaller.ExitCode`;
const result=spawnSync('powershell.exe',['-NoProfile','-Command',command],{windowsHide:true,stdio:'inherit'});
process.exitCode=result.status??1;
