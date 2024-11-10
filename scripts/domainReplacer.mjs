// May reset listeners, so this script should be the first

import {getCurrentOrigin, getDownloadOrigin} from "./domainManager.mjs";

document.body.innerHTML = document.body.innerHTML
    .replaceAll('{{host}}', getCurrentOrigin())
    .replaceAll('{{download}}', getDownloadOrigin());