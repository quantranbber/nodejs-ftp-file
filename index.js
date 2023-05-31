const ftp = require('basic-ftp');
const fs = require('fs');
const xlsx = require('xlsx');

async function execute() {
    const params = JSON.parse(process.argv[3] || '{}');
    console.info('-----START DOWNLOAD FTP FILE---', params);
    const folderPath = params.folderPath;
    const fileName = params.fileName;
    const ftpHost = params.ftpHost;
    const ftpPort = params.ftpPort;
    const ftpUser = params.ftpUser;
    const ftpPassword = params.ftpPassword;
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