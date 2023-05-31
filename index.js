const ftp = require('basic-ftp');
const fs = require('fs');
const xlsx = require('xlsx');

async function execute() {
    console.info('-------process params----------', process.argv);
    const params = process.argv[3].split(' ');
    console.info('-----START DOWNLOAD FTP FILE---', params);
    const folderPath = params.find((el) => el.includes('folderPath'))?.replace('--folderPath=', '');
    const fileName = params.find((el) => el.includes('fileName'))?.replace('--fileName=', '');
    const ftpHost = params.find((el) => el.includes('ftpHost'))?.replace('--ftpHost=', '');
    const ftpPort = params.find((el) => el.includes('ftpPort'))?.replace('--ftpPort=', '');
    const ftpUser = params.find((el) => el.includes('ftpUser'))?.replace('--ftpUser=', '');
    const ftpPassword = params.find((el) => el.includes('ftpPassword'))?.replace('--ftpPassword=', '');
    console.info("folderPath: ", folderPath);
    console.info("fileName: ", fileName);
    console.info("ftpHost: ", ftpHost);
    console.info("ftpPort: ", ftpPort);
    console.info("ftpUser: ", ftpUser);
    console.info("ftpPassword: ", ftpPassword);
    if (!fileName || !ftpPort || !ftpPort || !ftpUser || !ftpPassword) {
        return;
    }
    const fileRemotePath = folderPath ? `${folderPath}/${fileName}` : fileName;
    const csvFileName = fileName.replace(/([^\.]+$)/, 'csv');
    let writeStream = fs.createWriteStream(fileName);
    const client = new ftp.Client();

    try {
        await client.access({
            host: ftpHost,
            port: ftpPort,
            user: ftpUser,
            password: ftpPassword,
        });
        await client.downloadTo(writeStream, fileRemotePath);
        await client.close();

        console.info('-----DOWNLOAD FTP FILE SUCCESS---');
        console.info('-----START CONVERT TO CSV FILE---');
        const tmpCsv = csvFileName;
        const buffer = fs.readFileSync(fileName);
        const wb = xlsx.read(buffer);
        // path to csv file
        xlsx.writeFile(wb, tmpCsv, { bookType: 'csv' });

        fs.rmSync(fileName);

        console.info('-----CONVERT CSV FILE SUCCESS---');
    } catch (error) {
        console.error(`CONNECT FTP-SERVER HOST ${process.env}`, error);
    }
}

execute();
