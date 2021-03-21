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
- `400 Bad Request` ak je obsah požiadavky v zlom formáte alebo chýba niektorý z povinných údajov
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
        "timestamp": Number
    },
    {
        ...
    }
]
```
*Pozn. Timestamp je uvádzaný ako UNIX Timestamp v sekundách*

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
- `200 OK` ak aktualizácia prebehla úspešne
- `400 Bad Request` ak chýba telo požiadavky alebo token
- `404 Not Found` ak zariadenie neexistuje
- `500 Internal Server Error`

JSON odpoveď je objekt aktualizovaného zariadenia. Podobne ako pri `GET /devices/<token>`

### Odstránenie zariadenia

**Definícia**
`DELETE /devices/<token>`

**Odpoveď**
- `204 No Content` ak bolo zariadenie úspešne odstránené
- `400 Bad Request` ak nebol uvedený token
- `404 Not Found` ak požadované zariadenie neexistuje
- `500 Internal Server Error`

## Dáta (Data)

### Zapísanie dát do databázy

**Definícia**
`POST /data/<token>`

**Obsah tela**
Obsah sa môže líšiť podľa zariadenia! API rozhoduje ako dáta formovať podľa typu zariadenia.

(1) Thermometer a lightSensor

| Atribút   |      Typ      |  Pozn. |
|:----------:|:-------------:|:------:|
| `value`* |  number | Nameraná hodnota |

*Podpora zariadení bude rozširovaná priebežne*

**Odpoveď**
- `204 No Content` ak zápis prebehol úspešne
- `400 Bad Request` ak v tele alebo požiadavke chýba povinná hodnota alebo bola chybne uvedená
- `404 Not Found` ak token zariadenia nie je platný resp. zariadenie neexistuje
- `500 Internal Server Error`

### Získanie dát

#### Podľa tokenu zariadenia
**Definícia**

`GET /data/<token>`

**Filter**
Dáta je možné taktiež filtrovať aj podľa UNIX Timestamp-u (v sekundách) pomocou parametrov `startDate` a `endDate`. 
Napríklad:
- `GET /data/<token>?startDate=1615049433`
    - Dáta ktoré boli namerané od príslušného dátumu/času
- `GET /data/<token>?startDate=X&endDate=Y`
    - Dáta boli namerané od X do Y

**Odpoveď**
- `200 OK` ak požiadavka prebehla úspešne a boli vrátené dáta
- `400 Bad Request` ak nebol zadaný žiadny token
- `404 Not Found` ak bol použitý nesprávny token resp. zariadenie neexistuje
- `204 No Content` ak požiadavka prebehla úspešne avšak žiadne dáta nevyhovujú filtru alebo neexistujú

JSON objekt
*Príklad JSON odpovedi na požiadavku získania dát z teplomera. Dáta v odpovede sa líšia na základe filtrovaného zariadenia*
```json
{
    "device" {
        "name": String,
        "description": String,
        "type": String,
        ...
    },
    "data": [
        {
            "id": String,
            "value": Number,
            "timestamp": Number
        },
        {
            "id": String,
            "value": Number,
            "timestamp": Number
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
Všetky valídne parametre zariadenia

Taktiež je možné použiť parametre `startDate` a `endDate` s UNIX timestamp hodnotou (v sekundách) pre podrobnejšie filtrovanie podľa času a dátumu. (viď. [požiadavka na základe tokenu](###Podľa-tokenu-zariadenia))

**Odpoveď**
- `200 OK` ak požiadavka prebehla úspešne a boli vrátene dáta
- `204 No Content` ak požiadavka prebehla úspešne avšak neboli nájdené žiadne dáta
- `400 Bad Request` ak bol zle špecifikovaný filter resp. neboli uvedené žiadne parametre
- `404 Not Found` ak neexistuje žiadne zariadenie vyhovujúce požiadavkám

JSON objekt je podobný ako u [požiadavky na základe tokenu](####Podľa-tokenu-zariadenia) avšak jedná sa o zoznam viacerých zariadení vyhovujúcich filtru

### Získanie jedného záznamu
**Definícia**

`GET /data/<token>/<id>`

**Parametre**

| Parameter   |      Typ      |  Pozn. |
|----------|:-------------:|------:|
| `token` |  string | identifikačný token zariadenia |
| `id` | string | ID záznamu |

**Odpoveď**
- `200 OK` ak požiadavka prebehla úspešne
- `400 Bad Request` ak v požiadavke chýba povinný údaj
- `404 Not Found` ak zariadenie zodpovedajúce tokenu neexistuje
- `500 Internal Server Error`

JSON objekt (Dáta sa môžu líšiť podľa typu zariadenia)
```json
{
    "id": String,
    "value": Number,
    "timestamp": Number
}
```

### Úprava dát
**Definícia**

`PUT /data/<token>/<id>`

**Obsah tela**

| Parameter   |      Typ      |  Pozn. |
|----------|:-------------:|------:|
| `value` |  number | Nová hodnota záznamu |
| `timestamp` |  number | UNIX timestamp od (v sekundách) |

**Odpoveď**
- `204 No Content` ak požiadavka prebehla úspešne
- `400 Bad Request` ak v požiadavke chýba niektorý z povinných údajov
- `404 Not Found` ak zariadenie zodpovedajúce tokenu neexistuje
- `500 Internal Server Error`

### Mazanie dát
**Definícia**

Dáta je možne mazať dvoma spôsobmi:

1. Podľa ID

`DELETE /data/<token>?id=X`

2. Podľa časového rozpätia

`DELETE /data/<token>?startDate=X&endDate=X`

**Parametre**

| Parameter   |      Typ      |  Pozn. |
|----------|:-------------:|------:|
| `id` |  number | ID dátového záznamu |
| `startDate` |  number | UNIX timestamp od (v sekundách) |
| `endDate` |  number | UNIX timestamp do (v sekundách) |

**Odpoveď**
- `204 No Content` ak bola požiadavka úspešná a požadované záznamy boli zmazané
- `400 Bad Request` ak chýba niektorý z povinných údajov v požiadavke
- `404 Not Found` ak neexistuje zariadenie zodpovedajúce tokenu
- `500 Internal Server Error`

### Získanie stavu lampy

**Definícia**

`GET /data/lamp`

**Obsah tela**

| Parameter   |      Typ      |  Pozn. |
|----------|:-------------:|------:|
| `token`* |  string | Identifikačný token zariadenia |

**Odpoveď**
- `200 OK` ak bola požiadavka úspešne úspešná
- `400 Bad Request` ak chýba povinný údaj v požiadavke
- `500 Internal Server Error`

JSON objekt
```json
{
    "status": string,
    "data": {
        "isOn": bool,
        "hue": number,
        "sat": number,
        "brightness": number
    }
}
```

### Zmena stavu lampy

**Definícia**

`PUT /data/lamp`

**Obsah tela**
| Parameter   |      Typ      |  Pozn. |
|----------|:-------------:|------:|
| `token`* |  string | Identifikačný token zariadenia |
| `isOn` |  bool | Stav lampy |
| `hue` |  number | Hodnota odtieňu svetla |
| `sat` |  number | Saturácia svetla |
| `brightness` |  number | Jas svetla |

**Odpoveď**
- `200 OK` ak požiadavka prebehla úspešne
- `400 Bad Request` ak chýba povinný údaj v požiadavke
- `500 Internal Servero Error`

JSON objekt - objekt upravenej lampy (podobný ako pri získavaní lampy)



