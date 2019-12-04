vm = new Vue({
    el: '#app',
    data: {
        message: '',
        percent : '0',
        statusBattery: '',
        messageStatusBattery : '',
        serialNumber: 'Non indiqué'
    },
    methods: {
        addMessage: function () {
            document.getElementById('percent').innerHTML += '<span>' + this.message + '</span>'
        }
    }
})

var notif = 0;

function readTextFile(file) {
    var rawFile = new XMLHttpRequest();
    rawFile.open("GET", file, false);
    rawFile.onreadystatechange = function () {
        if (rawFile.readyState === 4) {
            if (rawFile.status === 200 || rawFile.status == 0) {

                var battery = parseInt(rawFile.responseText);
                vm.percent = battery + '%';
                document.getElementById('batteryIntern').style.height = battery + '%';

                //Valeur minimum 50
                if (battery < 50) {
                    if (notif != 50) {
                        let myNotification = new Notification(battery + '% | Batterie faible !', {
                            body: 'Votre batterie est en dessous de 50%'
                        })
                        notif = 50
                    }
                    if (vm.statusBattery == 'charging') {
                        document.getElementById('batteryIntern').style.backgroundColor = "green";
                        vm.message = 'Nickel 👍';
                    } else {
                        document.getElementById('batteryIntern').style.backgroundColor = "red";
                        vm.message = 'Branchez !';
                    }
                }
                //Valeur maximum 80
                else if (battery > 80) {
                    if (notif != 80) {
                        let myNotification = new Notification(battery + '% | Batterie trop élevée !', {
                            body: 'Votre batterie est au dessus de 80%'
                        })
                        notif = 80
                    }
                    if (vm.statusBattery == 'charging') {
                        document.getElementById('batteryIntern').style.backgroundColor = "red";
                        vm.message = 'Débranchez !';
                    } else {
                        document.getElementById('batteryIntern').style.backgroundColor = "green";
                        vm.message = 'Nickel 👍';
                    }
                } else {
                    document.getElementById('batteryIntern').style.backgroundColor = "green";
                    vm.message = 'Nickel 👍';
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


//Configurations
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
                        vm.statusBattery = 'charging';
                        vm.messageStatusBattery = 'En charge &nbsp;<i class="fas fa-bolt"></i>';
                    } else {
                        vm.statusBattery = 'none';
                        vm.messageStatusBattery = 'Débranché';
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




//Graphique
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