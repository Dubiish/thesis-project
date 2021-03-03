# Projekt ku bakalárskej práci
## Implementácia API rozhrania IoT zariadení s využitím nerelačných databáz

## Štruktúra
- Hlavný spúšťací kód je možné nájsť v súbore `index.js`
- Štruktúra projektu pozostáva zo 4 častí špecifikovaných v samotnej práci.
- Konkrétne moduly je možné nájsť v adresári `lib`

## Využité technológie
- **Node.js** + **Express.JS** pre serverovú časť
- **MongoDB** pre databázu
- **Mocha** testing framework pre testovanie funkcionality

# API Dokumentácia

## Použitie

Všetky odpovede sú v JSON formáte. V niektorých prípadoch API odpovedá len prostredníctvom status kódu a preto je obsah odpovede prázdny.

Zariadenia sú identifikované unikátnym identifikátorom s názvom *token*. Tento identifikátor sa nemení a pomocou neho je možné vykonávať niektoré požiadavky.

## Zariadenia (Devices)

### Registrovanie nového zariadenia

**Definícia**

`POST /devices`

**Obsah tela**

| Atribút   |      Typ      |  Pozn. |
|----------|:-------------:|------:|
| `name`* |  string | Názov zariadenia |
| `description` |    string   |   Popis zariadenia |
| `address`* | string |    IP adresa zariadenia |
| `type`* |    string   |  Typ zariadenia (thermometer, lamp atď.) |
| `location` |    string   |   Miestnosť v ktorej sa dané zariadenia nachádza |

**Odpoveď**

- `201 Created` ak vytvorenie prebehlo úspešne
- `500 Internal Server Error`
- `400 Bad Request` ak je obsah požiadavky v zlom formáte
- `403 Forbidden` ak už je podobné zariadenie registrované

```json
{
    "token": "16 znakový string"
}
```

*Token je unikátny identifikátor, ktorý je potrebný pri vykonávaní niektorých požiadaviek*

### Získanie zariadení s využitím tokenu

**Definícia**
`GET /devices/<token>`

Príklad použitia:
- `GET /devices/7b7f88226f41d2bd8f4782d0f1e0182c`

**Odpoveď**

- `200 OK` ak boli dáta získané úspešne
- `204 No Content` ak požiadavka bola úspešná avšak neboli nájdené žiadne dáta vyhovujúce parametrom
- `400 Bad Request` ak bol uvedený nesprávny token

JSON objekt
```json
[
    {
        "name": String,
        "description": String,
        "address": String,
        "type": String,
        "location": String,
        "token": String,
        "createdAt": Datetime String,
        "updatedAt": Datetime String
    },
    {
        ...
    }
]
```

### Získanie zariadení s využitím filtra

**Definícia**
`GET /devices`

Príklad použitia:
- `GET /devices` (Bez parametrov)
- `GET /devices?type=thermometer`
- `GET /devices?type=lamp&name=Xiaomi lamp`
- `GET /devices?address=192.168.1.5`

**Parametre filtra**
- name
- description
- address
- type
- location
- token

**Odpoveď**

- `200 OK` ak boli dáta získané úspešne
- `204 No Content` ak požiadavka bola úspešná avšak neboli nájdené žiadne dáta vyhovujúce parametrom

JSON odpoveď je rovnaká ako u [vyhľadávanie s tokenom](###Získanie-zariadení-s-využitím-tokenu)

### Aktualizácia údajov zariadenia

**Definícia**
`PUT /devices/<token>`

**Obsah tela**
Rovnaký ako pri [vytváraní nového zariadenia](###Registrovanie-nového-zariadenia)

**Odpoveď**
- `204 No Content` ak aktualizácia prebehla úspešne
- `400 Bad Request` ak chýba telo požiadavky
- `404 Not Found` ak bol uvedený nesprávny token
- `500 Internal Server Error`

### Odstránenie zariadenia

**Definícia**
`DELETE /devices/<token>`

**Odpoveď**
- `204 No Content` ak bolo zariadenie odstránené
- `404 Not Found` ak bol uvedený nesprávny token
- `500 Internal Server Error`

## Dáta (Data)

### Zapísanie dát do databázy

**Definícia**
`POST /data/<token>`

**Obsah tela**
Obsah sa môže líšiť podľa zariadenia! API rozhoduje ako dáta formovať podľa typu zariadenia.

(1) *thermometer* a *lightSensor*
| Atribút   |      Typ      |  Pozn. |
|----------|:-------------:|------:|
| `value`* |  number | Nameraná hodnota |

*Podpora zariadení bude rozširovaná priebežne*

**Odpoveď**
- `204 No Content` ak zápis prebehol úspešne
- `400 Bad Request` ak v tele chýba povinná hodnota
- `404 Not Found` ak token zariadenia nie je platný resp. zariadenie neexistuje
- `500 Internal Server Error`

### Získanie dát

#### Podľa tokenu zariadenia
**Definícia**

`GET /data/<token>`

TODO: Pridanie podpory vyhľadávanie na základe času 
- Napr. `GET /data/<token>?at=22.4.2020`

**Odpoveď**
- `200 OK` ak požiadavka prebehla úspešne a boli vrátené dáta
- `204 No Content` ak požiadavka prebehla úspešne ale neboli nájdené žiadne dáta
- `400 Bad Request` ak nebol zadaný žiadny token
- `404 Not Found` ak bol použitý nesprávny token resp. zariadenie neexistuje
- `500 Internal Server Error`

JSON objekt
*Príklad JSON odpovedi na požiadavku získania dát z teplomera. Dáta v odpovede sa líšia na základe filtrovaného zariadenia*
```json
{
    "name": String,
    "description": String,
    "type": String,
    ...
    "data": [
        {
            "value": Number,
            "createdAt": Datetime String
        },
        {
            "value": Number,
            "createdAt": Datetime String
        },
        ...
    ]
}
```

#### Podľa filtra
**Definícia**

`GET /data`

Príklad použitia:
- `GET /data?type=thermometer&location=office`
- `GET /data?name=MyLightSensor`

**Parametre**
Všetky validné parametre zariadenia

**Odpoveď**
- `200 OK` ak požiadavka prebehla úspešne a boli vrátene dáta
- `204 No Content` ak požiadavka prebehla úspešne avšak neboli nájdené žiadne dáta
- `400 Bad Request` ak bol zle špecifikovaný filter resp. neboli uvedené žiadne parametre
- `404 Not Found` ak neexistuje žiadne zariadenie vyhovujúce požiadavkám
- `500 Internal Server Error`

JSON objekt je podobný ako u [požiadavky na základe tokenu](####Podľa-tokenu-zariadenia) avšak jedná sa o zoznam viacerých zariadení vyhovujúcich filtru