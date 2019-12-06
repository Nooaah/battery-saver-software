vm = new Vue({
    el: '#app',
    data: {
        message: '',
        percent: '0',
        os: {
            name: '',
            icon: ''
        },
        lost: 0,
        messagechargingTime: 'minutes',
        chargingTime: null,
        dischargingTime: null,
        messageDischargingTime: 'Chargement...',
        statusBattery: '',
        messageStatusBattery: 'Chargement...',
        serialNumber: 'Non indiqué',
    },
    methods: {
        addMessage: function () {
            document.getElementById('percent').innerHTML += '<span>' + this.message + '</span>'
        }
    }
})

os = navigator.platform;
if (os == 'Win32') {
    vm.os.name = 'Windows';
    vm.os.icon = '<i class="fab fa-windows"></i>';
} else if (os == 'MacIntel') {
    vm.os.name = 'Mac';
    vm.os.icon = '<i class="fab fa-apple"></i>';

    var batteryIsCharging = false;
    navigator.getBattery().then(function (battery) {
        //Chargé ou déchargé
        setInterval(() => {
            batteryIsCharging = battery.charging;
            if (battery.charging) {
                vm.statusBattery = 'charging';
                vm.messageStatusBattery = 'En charge &nbsp;<i class="fas fa-bolt"></i>';
            } else {
                vm.statusBattery = 'none';
                vm.messageStatusBattery = 'Débranché';
            }
        }, 1000);

        //Temps restant sur la charge
        setInterval(() => {
            if (battery.dischargingTime != 'Infinity') {
                if (battery.dischargingTime / 60 > 60) {
                    vm.dischargingTime = parseInt((battery.dischargingTime / 60) / 60);
                    if (vm.dischargingTime > 1) {
                        vm.messageDischargingTime = 'heures'
                    } else if (vm.dischargingTime == 1) {
                        vm.messageDischargingTime = 'heure'
                    }
                } else {
                    vm.dischargingTime = parseInt((battery.dischargingTime / 60));
                    vm.messageDischargingTime = 'minutes'
                }
            } else {
                vm.dischargingTime = '';
                vm.messageDischargingTime = 'Infiny'
            }
        }, 1000);


    });


    //Changement pourcentage
    batteryIsCharging = false;
    navigator.getBattery().then(function (battery) {
        setInterval(function () {
            vm.percent = Math.round(battery.level * 100) + '%';
            document.getElementById('batteryIntern').style.height = battery.level * 100 + '%';
        }, 1000);

        vm.percent = Math.round(battery.level * 100)  + '%';
        document.getElementById('batteryIntern').style.height = battery.level * 100 + '%';

    });

} else //LINUX
{
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
}

let myNotification = new Notification('Bonjour Noah ! Voyez toutes les configurations de votre machine ' + vm.os.name, {
    body: ''
})



//Graphique
setInterval(() => {
    var heure = new Date();
    if (myLineChart.data.labels.length >= 60) {
        myLineChart.data.labels.shift();
        myLineChart.data.datasets[0].data.shift();
    }
    myLineChart.data.labels.push(heure.getHours() + ':' + heure.getMinutes());
    myLineChart.data.datasets[0].data.push(parseInt(vm.percent));
    myLineChart.update();
    if (myLineChart.data.datasets[0].data.length > 3) {
        vm.lost = (myLineChart.data.datasets[0].data[myLineChart.data.datasets[0].data.length - 1] - myLineChart.data.datasets[0].data[0]) / myLineChart.data.datasets[0].data.length;
        vm.lost = vm.lost.toFixed(2);
    }
}, 60000) //60000

//line
var ctxL = document.getElementById("lineChart").getContext('2d');
var myLineChart = new Chart(ctxL, {
    type: 'line',
    data: {
        labels: [],
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
setTimeout(() => {
    var heure = new Date();
    myLineChart.data.labels.shift();
    myLineChart.data.datasets[0].data.shift();
    myLineChart.data.labels.push(heure.getHours() + ':' + heure.getMinutes());
    myLineChart.data.datasets[0].data.push(parseInt(vm.percent));
    myLineChart.update();
}, 2000);