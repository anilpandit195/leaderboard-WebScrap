const request = require("request");
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const fs = require("fs");
const xlsx = require("json-as-xlsx")

const link = "https://www.espncricinfo.com/series/ipl-2021-1249214/match-results"
let leaderbord = [];
let count = 0;

request(link, cb);

function cb(error, response, html) {
    if (error) {
        console.log(error);
    }
    else {
        const dom = new JSDOM(html);
        const document = dom.window.document;
        let allscortag = document.querySelectorAll('.ds-border-b.ds-border-line');
        // console.log(allscortag.length);
        for (let i = 0; i < 60; i++) {
            let alltags = allscortag[i].querySelectorAll("a");
            let link = alltags[2].href;
            let completelink = "https://www.espncricinfo.com" + link;
            // console.log(completelink.length);
            request(completelink, cb2);
            count++;
        }
    }
}

function cb2(error, response, html) {
    if (error) {
        console.log(error);
    }
    else {
        const dom = new JSDOM(html);
        const document = dom.window.document;
        let batsmanRow = document.querySelectorAll('tbody [class="ds-border-b ds-border-line ds-text-tight-s"]');
        for (let i = 0; i < batsmanRow.length; i++) {
            let cells = batsmanRow[i].querySelectorAll("td");
            if (cells.length == 8) {
                let name = cells[0].textContent;
                let runs = cells[2].textContent;
                let ball = cells[3].textContent;
                let four = cells[5].textContent;
                let sixe = cells[6].textContent;
                // console.log("Name: ", name, "Runs: ", runs, "Balls: ", ball, "fours: ", four, "sixes: ", sixe);
                processplayer(name, runs, ball, four, sixe);

            }
        }
        count--;
        if (count == 0) {
            console.log(leaderbord);
            let data = JSON.stringify(leaderbord);
            fs.writeFileSync('BatsManDetails.json', data);
            let dataExcel = [
                {
                    sheet: "Ipl Stats",
                    columns: [
                        { label: "Name", value: "Name" }, // Top level data
                        { label: "Innings", value: "Innings" },
                        { label: "Run", value: "Run" }, // Custom format
                        { label: "Ball", value: "Ball" }, // Run functions
                        { label: "Four", value: "Four" },
                        { label: "Sixe", value: "Sixe" },
                    ],
                    content: leaderbord
                    //[{Name:"Rahul",Innings:16,Runs:422,Balls......}]
                },
            ]
            let settings = {
                fileName: "BatsmenDetail", // Name of the resulting spreadsheet
                extraLength: 3, // A bigger number means that columns will be wider
                writeOptions: {}, // Style options from https://github.com/SheetJS/sheetjs#writing-options
            }
            xlsx(dataExcel, settings) // Will download the excel file
        }
    }
}


function processplayer(name, runs, ball, four, sixe) {
    runs = Number(runs);
    ball = Number(ball);
    four = Number(four);
    sixe = Number(sixe);
    for (let i = 0; i < leaderbord.length; i++) {
        let playerobject = leaderbord[i];
        if (playerobject.Name == name) {
            playerobject.Run += runs;
            playerobject.Innings += 1;
            playerobject.Ball += ball;
            playerobject.Four += four;
            playerobject.Sixe += sixe;
            return;
        }
    }
    let obj = {
        Name: name,
        Innings: 1,
        Run: runs,
        Ball: ball,
        Four: four,
        Sixe: sixe
    }
    leaderbord.push(obj);
}