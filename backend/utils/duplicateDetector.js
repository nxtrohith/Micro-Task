const { imageHash } = require("image-hash");
const axios = require("axios");

function hashFromBuffer(buffer) {
  return new Promise((resolve, reject) => {
    imageHash(buffer, 16, true, (err, hash) => {
      if (err) return reject(err);
      resolve(hash);
    });
  });
}

function hashFromUrl(url) {
  return new Promise(async (resolve, reject) => {
    try {
      const response = await axios.get(url, { responseType: "arraybuffer" });

      imageHash(Buffer.from(response.data), 16, true, (err, hash) => {
        if (err) return reject(err);
        resolve(hash);
      });

    } catch (err) {
      reject(err);
    }
  });
}

function hammingDistance(a, b) {
  let dist = 0;

  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) dist++;
  }

  return dist;
}

async function findDuplicate(newBuffer, existingIssues) {

  const newHash = await hashFromBuffer(newBuffer);

  for (const issue of existingIssues) {

    if (!issue.imageUrl) continue;

    const oldHash = await hashFromUrl(issue.imageUrl);

    const diff = hammingDistance(newHash, oldHash);

    if (diff < 10) {
      return i;
    }

  }

  return null;
}

module.exports = { findDuplicate };