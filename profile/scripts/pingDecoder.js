function playerGroup(data) {
    const out = {};

    for (const row of data) {
        if (out[row.Name] === undefined) out[row.Name] = [];
        out[row.Name].push(row);
    }
    return out;
}

function toPointArray(data, name) {
    const out = [];
    for (const row of data) {
        if (row[name] !== '0')
            out.push({x: row.Time, y: row[name]})
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
    const hypixelPingE = document.getElementById('ServerPing');
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

    const myPingE = document.getElementById('PluginChannelPing');
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

    const brtE = document.getElementById('BRT');
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

            hypixelPingChart.data.datasets = generateDataset(gr, "ServerPing");
            hypixelPingChart.update();

            myPingChart.data.datasets = generateDataset(gr, "PluginChannelPing");
            myPingChart.update();

            DJPingChart.data.datasets = generateDataset(gr, "DJPing");
            DJPingChart.update();

            brtChart.data.datasets = generateDataset(gr, "BRT");
            brtChart.update();
            $("#plotBlocks").removeClass("invisible")
        };
    });
});