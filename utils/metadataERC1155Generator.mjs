import fs from 'fs';
import process from 'process';
import { Web3Storage, getFilesFromPath } from 'web3.storage'
import dotenv from 'dotenv';
dotenv.config()

const basePath = process.cwd();

async function main (filePaths) {
  const files = [];
  const token = process.env.IPFS_STORAGE_TOKEN;
  const storage = new Web3Storage({ token })

  for (const path of filePaths) {
    console.log(path, "path");
    const pathFiles = await getFilesFromPath(path)
    files.push(...pathFiles)
  }

  console.log(`Uploading ${files.length} files`);
  const cid = await storage.put(files);
  console.log('Content added with CID:', cid);
  return cid;
}


(async () => {
// General metadata for Ethereum
  const cid = await main([`./buildIPFS/ERC1155/images/`]);
  const baseUri = `ipfs://${cid}/images`;
  console.log('Lookin URL is ', `https://dweb.link/ipfs/${cid}/images/`)

// read json data
  let rawData = fs.readFileSync(`${basePath}/buildIPFS/ERC1155/_metadata.json`);
  let data = JSON.parse(rawData);

  data.forEach((item) => {
    item.image = `${baseUri}/${item.edition}.png`;
    const {edition, key, ...data} = item;
    fs.writeFileSync(
      `${basePath}/buildIPFS/ERC1155/metadata/${item.key}`,
      JSON.stringify(data, null, 2)
    );
  });
  console.log(`Updated baseUri for images to ===> ${baseUri}`);
  const cidJSON = await main([`./buildIPFS/ERC1155/metadata/`]);
  console.log('JSON CID is:', cidJSON);
  console.log('Lookin URL for JSON CID is: ', `https://dweb.link/ipfs/${cidJSON}/metadata`)
  console.log('--------------------------------------------------------------');
  console.log('In Contract use this URL type: ', `ipfs://${cidJSON}/metadata/`);

  fs.writeFile('ipfs1155Url.txt', `ipfs://${cidJSON}/metadata/`, function (err) {
    if (err) throw err;
    console.log('File is created successfully.');
  });
})();
