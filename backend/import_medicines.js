const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Medicine = require('./schema/Medicine');

dotenv.config();

const medicinesData = [
    {
        productId: "16066",
        name: "Panthenol Spray, 46,3 mg/g Schaum zur Anwendung",
        pzn: "04020784",
        price: 16.95,
        packageSize: "130 g",
        description: "Schaumspray zur Anwendung auf der Haut. Fördert die Regeneration gereizter oder geschädigter Haut und spendet Feuchtigkeit.",
        stock: 50,
        prescriptionRequired: false
    },
    {
        productId: "976308",
        name: "NORSAN Omega-3 Total",
        pzn: "13476520",
        price: 27.00,
        packageSize: "200 ml",
        description: "Flüssiges Omega-3-Öl aus Fisch. Unterstützt Herz, Gehirn und Gelenke.",
        stock: 50,
        prescriptionRequired: false
    },
    {
        productId: "977179",
        name: "NORSAN Omega-3 Vegan",
        pzn: "13476394",
        price: 29.00,
        packageSize: "100 ml",
        description: "Pflanzliches Omega-3 aus Algen. Geeignet für Vegetarier und Veganer.",
        stock: 50,
        prescriptionRequired: false
    },
    {
        productId: "1225428",
        name: "Vividrin iso EDO antiallergische Augentropfen",
        pzn: "16507327",
        price: 8.28,
        packageSize: "30x0.5 ml",
        description: "Konservierungsmittelfreie Augentropfen zur Linderung allergischer Beschwerden wie Juckreiz und Rötung.",
        stock: 50,
        prescriptionRequired: false
    },
    {
        productId: "202796",
        name: "Aqualibra 80 mg/90 mg/180 mg Filmtabletten",
        pzn: "00795287",
        price: 27.82,
        packageSize: "60 st",
        description: "Pflanzliches Arzneimittel zur Unterstützung der Blasenfunktion.",
        stock: 50,
        prescriptionRequired: false
    },
    {
        productId: "30955",
        name: "Cromo-ratiopharm Augentropfen Einzeldosis",
        pzn: "04884527",
        price: 7.59,
        packageSize: "20x0.5 ml",
        description: "Antiallergische Augentropfen zur Vorbeugung und Behandlung von allergischen Augenbeschwerden.",
        stock: 50,
        prescriptionRequired: false
    },
    {
        productId: "1162261",
        name: "Kijimea Reizdarm PRO",
        pzn: "15999676",
        price: 38.99,
        packageSize: "28 st",
        description: "Medizinisches Produkt zur Linderung von Symptomen des Reizdarmsyndroms wie Blähungen und Bauchschmerzen.",
        stock: 50,
        prescriptionRequired: false
    },
    {
        productId: "1329121",
        name: "Paracetamol apodiscounter 500 mg Tabletten",
        pzn: "18188323",
        price: 2.06,
        packageSize: "20 st",
        description: "Schmerz- und fiebersenkendes Arzneimittel.",
        stock: 50,
        prescriptionRequired: false
    },
    {
        productId: "11334",
        name: "Bepanthen WUND- UND HEILSALBE, 50 mg/g Salbe",
        pzn: "01580241",
        price: 7.69,
        packageSize: "20 g",
        description: "Salbe zur Unterstützung der Wundheilung und Pflege trockener Haut.",
        stock: 50,
        prescriptionRequired: false
    },
    {
        productId: "198010",
        name: "Loperamid akut - 1 A Pharma, 2 mg Hartkapseln",
        pzn: "01338066",
        price: 3.93,
        packageSize: "10 st",
        description: "Arzneimittel zur Behandlung von akutem Durchfall.",
        stock: 50,
        prescriptionRequired: false
    },
    {
        productId: "335765",
        name: "Nurofen 200 mg Schmelztabletten Lemon",
        pzn: "02547582",
        price: 10.98,
        packageSize: "12 st",
        description: "Ibuprofen-Schmerzmittel in schnell löslicher Form.",
        stock: 50,
        prescriptionRequired: false
    },
    {
        productId: "363715",
        name: "Vitamin B-Komplex-ratiopharm",
        pzn: "04132750",
        price: 24.97,
        packageSize: "60 st",
        description: "Kombination verschiedener B-Vitamine zur Unterstützung des Nervensystems.",
        stock: 50,
        prescriptionRequired: false
    },
    {
        productId: "376212",
        name: "Umckaloabo Saft für Kinder",
        pzn: "08871266",
        price: 13.15,
        packageSize: "120 ml",
        description: "Pflanzlicher Saft zur Behandlung von Atemwegsinfektionen bei Kindern.",
        stock: 50,
        prescriptionRequired: false
    },
    {
        productId: "368367",
        name: "DulcoLax Dragées, 5 mg magensaftresistente Tablette",
        pzn: "06800196",
        price: 22.90,
        packageSize: "100 st",
        description: "Abführmittel zur kurzfristigen Behandlung von Verstopfung.",
        stock: 50,
        prescriptionRequired: false
    }
];

const importData = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URL);
        console.log("Connected to MongoDB...");

        for (const item of medicinesData) {
            await Medicine.findOneAndUpdate(
                { pzn: item.pzn },
                item,
                { upsert: true, new: true }
            );
            console.log(`Imported/Updated: ${item.name}`);
        }

        console.log("Data import complete!");
        process.exit();
    } catch (error) {
        console.error("Error importing data:", error);
        process.exit(1);
    }
};

importData();
