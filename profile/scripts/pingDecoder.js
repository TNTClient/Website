function playerGroup(data) {
    const out = {};

    for (const row of data) {
        if (out[row.name] === undefined) out[row.name] = [];
        out[row.name].push(row);
    }
    return out;
}

function toPointArray(data, name) {
    const out = [];
    for (const row of data) {
        if (row[name] !== '0')
            out.push({x: row.time, y: row[name]})
        else out.push({x: undefined, y: undefined})
    }
    return out.sort(function (a, b) {
        return a.x - b.x;
    });
}

function generateDataset(data, name) {
    const out = [];
    for (const [key, value] of Object.entries(data)) {
        out.push(generateDataForDataset(toPointArray(value, name), key));
    }
    return out;
}

function generateDataForDataset(data, name) {
    return {
        label: name,
        showLine: true,
        data: data
    };
}

$(function () {
    const hypixelPingE = document.getElementById('hypixelPing');
    const hypixelPingChart = new Chart(hypixelPingE, {
        type: 'scatter',
        options: {
            plugins: {
                zoom: {
                    zoom: {
                        wheel: {
                            enabled: true,
                        },
                        drag: {
                            enabled: true,
                        },
                        pinch: {
                            enabled: true
                        },
                        mode: 'x',
                    }
                }
            }
        }
    });

    const myPingE = document.getElementById('myPing');
    const myPingChart = new Chart(myPingE, {
        type: 'scatter',
        options: {
            plugins: {
                zoom: {
                    zoom: {
                        wheel: {
                            enabled: true,
                        },
                        drag: {
                            enabled: true,
                        },
                        pinch: {
                            enabled: true
                        },
                        mode: 'x',
                    }
                }
            }
        }
    });

    const downloadSpeedE = document.getElementById('downloadSpeed');
    const downloadSpeedChart = new Chart(downloadSpeedE, {
        type: 'scatter',
        options: {
            plugins: {
                zoom: {
                    zoom: {
                        wheel: {
                            enabled: true,
                        },
                        drag: {
                            enabled: true,
                        },
                        pinch: {
                            enabled: true
                        },
                        mode: 'x',
                    }
                }
            }
        }
    });

    const uploadSpeedE = document.getElementById('uploadSpeed');
    const uploadSpeedChart = new Chart(uploadSpeedE, {
        type: 'scatter',
        options: {
            plugins: {
                zoom: {
                    zoom: {
                        wheel: {
                            enabled: true,
                        },
                        drag: {
                            enabled: true,
                        },
                        pinch: {
                            enabled: true
                        },
                        mode: 'x',
                    }
                }
            }
        }
    });

    const DJPingE = document.getElementById('DJPing');
    const DJPingChart = new Chart(DJPingE, {
        type: 'scatter',
        options: {
            plugins: {
                zoom: {
                    zoom: {
                        wheel: {
                            enabled: true,
                        },
                        drag: {
                            enabled: true,
                        },
                        pinch: {
                            enabled: true
                        },
                        mode: 'x',
                    }
                }
            }
        }
    });

    const brtE = document.getElementById('brt');
    const brtChart = new Chart(brtE, {
        type: 'scatter',
        options: {
            plugins: {
                zoom: {
                    zoom: {
                        wheel: {
                            enabled: true,
                        },
                        drag: {
                            enabled: true,
                        },
                        pinch: {
                            enabled: true
                        },
                        mode: 'x',
                    }
                }
            }
        }
    });


    const capeFileElement = document.getElementById("pingFile");
    capeFileElement.addEventListener("change", function () {
        const reader = new FileReader();
        reader.readAsText(capeFileElement.files[0]);
        reader.onload = function (e) {
            const data = $.csv.toObjects(e.target.result, {
                separator: ','
            });

            console.log('File content:', data);
            const gr = playerGroup(data);

            hypixelPingChart.data.datasets = generateDataset(gr, "hypixelPing");
            hypixelPingChart.update();

            myPingChart.data.datasets = generateDataset(gr, "mySystemPing");
            myPingChart.update();

            downloadSpeedChart.data.datasets = generateDataset(gr, "hypixelDownload");
            downloadSpeedChart.update();

            uploadSpeedChart.data.datasets = generateDataset(gr, "hypixelUpload");
            uploadSpeedChart.update();

            DJPingChart.data.datasets = generateDataset(gr, "DJPing");
            DJPingChart.update();

            brtChart.data.datasets = generateDataset(gr, "brt");
            brtChart.update();
            $("#plotBlocks").removeClass("invisible")
        };
    });
});