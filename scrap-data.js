// 1 - Import de puppeteer
const puppeteer = require("puppeteer")
var request = require('sync-request');

// boucle sur toutes le spages 
let navigationAllPage=async()=>{

        let idSpreadSheet = '1Syk9p1p3zox4GFBne5Q4kIdD-W3E2LkfxPYOun-ctFE'
        // ----------- recup sheet
        var list = request('GET', `https://sheets.googleapis.com/v4/spreadsheets/${idSpreadSheet}/values/A1%3AA1411?valueRenderOption=FORMATTED_VALUE&majorDimension=ROWS&key=AIzaSyDh-kOfMXTASQmK8wS7WC6qBBZfetmxJso`)
        var response = JSON.parse(list.getBody())
        //console.log(response.values)
        let allLinkFromGSheet = response.values


        // ------------------------- Boucle lien sheet
        let nbLienSheet = allLinkFromGSheet.length
        console.log(nbLienSheet)

        //creation tableau récupéré 
        const dataRecupFromUrl=[]

        // ------------------------------------------ Boucle lien GSheet ---------------------
        const browser = await puppeteer.launch()
        //const browser = await puppeteer.launch({ headless: false })


        for(let i = 0; i<nbLienSheet;i++){
            //recuperation lien google sheet
            let urlCible=allLinkFromGSheet[i][0]
            console.log(`url ----> ${urlCible}`)
            // ouverture navigateur :
            const page = await browser.newPage()
            await page.waitForSelector('body')
            await page.goto(urlCible)
            await page.setViewport({ width: 1980, height: 1920 }) 

            let infoFromPageSelector ="aucun test"
            

            //recup info si mal place sur la page

            let allQuery =async ()=>{
                let selectorEmail="body > div > div > div.content.clearfix > div > div > div.seven.columns > div > p:nth-child(27) > a"

                //----- map oon all likn
                const result = await page.evaluate(() =>{
                    let url=[...document.querySelectorAll(`p > a`)].map(link => link.href )
                    let title=document.querySelector(".pf-item-title-text").innerText
                    let activite = document.querySelector("div.pfmaincontactinfo > section > div > div")
                    let activitelist=""

                    // gestion erreure
                    if(activite!=null){
                        activitelist= document.querySelector("div.pfmaincontactinfo > section > div > div").innerText
                     }else(activitelist="")


                    return {title,url,activitelist}   
                    
                }
               
                )

                let recupInfo =JSON.stringify(result)

                console.log(`console log result map ==== ${recupInfo}`)
                let data=[recupInfo]

                // Envoi des résultats dans le array
                dataRecupFromUrl.push(recupInfo)
                
                return {result}
            }
            allQuery()

            


            //recup info direct  sur la page
            let dataPage = await page.evaluate(async () => {
                let selectorEmail="h1"
                let selectorGet=document.querySelector(`${selectorEmail}`)

                    // verification de la présence de l'item 
                    if(selectorGet!=null){
                        infoFromPageSelector= document.querySelector(`${selectorEmail}`).innerText 
                     //   console.log(`email=${infoFromPageSelector}`)
                    }else(
                        infoFromPageSelector="aucun"
                        )
                        
                 console.log(`email=${infoFromPageSelector}`)


                  return infoFromPageSelector
                })
                
                
                
               // dataRecupFromUrl.push(dataPage)
                //console.log(`datarecupfromhtml = --- ${dataPage}`)


        
                await page.close()
            // Lecture HTMl 

        }



    await browser.close()

    return dataRecupFromUrl
}


// Appelle la fonction getData() et affichage les données retournées
navigationAllPage().then(value => {
 console.table(`value result scenario === ${value}`)


// Export dans un xls
 let valuearray = value.map(l=>[l])
 const xlsx = require('xlsx')
 const wb = xlsx.utils.book_new();
 const ws = xlsx.utils.aoa_to_sheet(valuearray);
 xlsx.utils.book_append_sheet(wb,ws)
 xlsx.writeFile(wb,"links.xlsx");



})

