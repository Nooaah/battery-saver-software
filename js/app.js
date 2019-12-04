vm = new Vue({
    el: '#app',
    data: {
        message: 'test',
        statusBattery: '',
        serialNumber: 'Non indiqué'
    },
    methods: {
        changeMessage: function (text) {
            this.message = text;
        }
    }
})

vm.changeMessage('testgr')

var notif = 0;

function readTextFile(file) {
    var rawFile = new XMLHttpRequest();
    rawFile.open("GET", file, false);
    rawFile.onreadystatechange = function () {
        if (rawFile.readyState === 4) {
            if (rawFile.status === 200 || rawFile.status == 0) {
                var allText = rawFile.responseText;
                var battery = parseInt(allText);

                if (battery > 100) {
                    document.getElementById('percent').innerHTML = battery +
                        '%<br><center><span style="font-size:15px;">(surcharge)</span></center>';
                } else {
                    document.getElementById('percent').innerHTML = battery + '%';
                }
                document.getElementById('batteryIntern').style.height = battery + '%';

                //Valeur minimum
                if (battery < 50) {
                    if (notif != 50) {
                        let myNotification = new Notification(battery + '% | Branchez votre ordinateur', {
                            body: 'Votre batterie est en dessous de 50%'
                        })
                        notif = 50
                    }
                    if (document.getElementsByClassName('status')[0].innerHTML !=
                        'En charge &nbsp;<i class="fas fa-bolt"></i>') {
                        document.getElementById('batteryIntern').style.backgroundColor = "#FF0000";
                    } else {
                        document.getElementById('batteryIntern').style.color = "#00FF00";
                    }
                }
                //Valeur maximum
                else if (battery > 80) {
                    if (notif != 80) {
                        let myNotification = new Notification(battery + '% Branchez votre ordinateur', {
                            body: 'Votre batterie est en dessous de 80%'
                        })
                        notif = 80
                    }
                    if (document.getElementsByClassName('status')[0].innerHTML !=
                        'En charge &nbsp;<i class="fas fa-bolt"></i>') {
                        document.getElementById('batteryIntern').style.backgroundColor = "#00FF00";
                    } else {
                        document.getElementById('batteryIntern').style.color = "#FF0000";
                    }
                } else {
                    document.getElementById('batteryIntern').style.backgroundColor = "#00FF00";
                }

            }
        }
    }
    rawFile.send(null);
}
setInterval(() => {
    readTextFile("file:///sys/class/power_supply/BAT0/capacity");
}, 1000)
readTextFile("file:///sys/class/power_supply/BAT0/capacity");



function readSerialNumber(file, span) {
    var rawFile = new XMLHttpRequest();
    rawFile.open("GET", file, false);
    rawFile.onreadystatechange = function () {
        if (rawFile.readyState === 4) {
            if (rawFile.status === 200 || rawFile.status == 0) {
                var allText = rawFile.responseText;
                var text = allText.toString();

                if (span == 'status') {
                    if (text == 'Charging\n') {
                        vm.statusBattery = 'En charge &nbsp;<i class="fas fa-bolt"></i>';
                    } else {
                        vm.statusBattery = 'Débranché';
                    }
                }
                if (span == 'serialNumber') {
                    vm.serialNumber = text;
                }
            }
        }
    }
    rawFile.send(null);
}
readSerialNumber("file:///sys/class/power_supply/BAT0/serial_number", 'serialNumber');
readSerialNumber("file:///sys/class/power_supply/BAT0/status", 'status');

setInterval(() => {
    readSerialNumber("file:///sys/class/power_supply/BAT0/status", 'status');
}, 1000);

setInterval(() => {
    var heure = new Date();
    if (myLineChart.data.labels.length >= 30) {
        myLineChart.data.labels.shift();
        myLineChart.data.datasets[0].data.shift();
    }
    myLineChart.data.labels.push(heure.getHours() + ':' + heure.getMinutes());
    myLineChart.data.datasets[0].data.push("10");
    myLineChart.update();
}, 120000)

//line
var ctxL = document.getElementById("lineChart").getContext('2d');
var myLineChart = new Chart(ctxL, {
    type: 'line',
    data: {
        labels: ["0"],
        datasets: [{
            label: "Évolution de votre batterie",
            data: [0],
            backgroundColor: [
                'rgba(105, 0, 132, .2)',
            ],
            borderColor: [
                'rgba(200, 99, 132, .7)',
            ],
            borderWidth: 2
        }]
    },
    options: {
        responsive: true
    }
});
var heure = new Date();
myLineChart.data.labels.shift();
myLineChart.data.datasets[0].data.shift();
myLineChart.data.labels.push(heure.getHours() + ':' + heure.getMinutes());
myLineChart.data.datasets[0].data.push("10");
myLineChart.update();