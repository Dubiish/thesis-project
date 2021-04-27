# API Dokumentácia
## Implementácia API rozhrania IoT zariadení s využitím nerelačných databáz

## Základné informácie

Všetky odpovede sú v `JSON` formáte.
Zariadenia sú identifikované unikátnym identifikátorom s názvom *token*. Tento identifikátor sa nemení a pomocou neho je možné vykonávať niektoré požiadavky cielené na konkrétne zariadenia. Rozhranie pracuje s požiadavkami obsahujúce telo v JSON formáte a taktiež `dopyt` (query). V prípade časových údajov sa jedná o `UNIX časové známky`.

Každá odpoveď obsahuje položku *status*, ktorá môže nadobudnúť stav `OK` alebo `Failed` podľa úspešnosti požiadavky.
V prípade niektorých odpovedí (zväčša chybových hlásení) je možné nájsť v odpovedi taktiež parameter *message*, ktorý bližšie definuje zdroj chyby.

## Zariadenia (Devices)

### Registrovanie nového zariadenia

**Definícia**

`POST /devices`

**Obsah tela**

| Atribút   |      Typ      |  Popis |
|:----------|:-------------|:------|
| `name`* |  string | Názov zariadenia |
| `description` |    string   |   Popis zariadenia |
| `address`* | string |    IP adresa zariadenia |
| `type`* |    string   |  Typ zariadenia (thermometer, lamp atď.) |
| `location` |    string   |   Miestnosť v ktorej sa dané zariadenia nachádza |

```json
{
    "name": "...",
    "address": "...",
    "type": "...",
    ...
}
```

**Odpoveď**

- `201 Created` ak vytvorenie prebehlo úspešne
- `500 Internal Server Error`
- `400 Bad Request` ak je obsah požiadavky v zlom formáte alebo chýba niektorý z povinných údajov
- `403 Forbidden` ak už je podobné zariadenie registrované

```json
{   
    "status": "...",
    "token": "..."
}
```

### Získanie zariadení s využitím tokenu

**Definícia**

`GET /devices/:token`

Príklad použitia:

- `GET /devices/7b7f88226f41d2bd8f4782d0f1e0182c`

**Odpoveď**

- `200 OK` ak boli dáta získané úspešne (ak dáta neexistujú položka devices ostáva vo forme prázdneho poľa)

JSON objekt

```json
    "status": "...",
    "devices": [
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

Príklady použitia:

- `GET /devices` (Bez parametrov)
- `GET /devices?type=thermometer`
- `GET /devices?type=lamp&name=Xiaomi lamp`
- `GET /devices?address=192.168.1.5`

**Parametre filtra**

| Atribút   | Popis. |
|:----------|:-------|
| `name` | Názov zariadenia |
| `description` | Popis zariadenia |
| `address` | IP adresa zariadenia |
| `type` | Typ zariadenia (thermometer, lamp atď.) |
| `location` |   Miestnosť v ktorej sa dané zariadenia nachádza |
| `token` | Identifikačný token zariadenia |

**Odpoveď**

- `200 OK` ak boli dáta získané úspešne (v prípade žiadneho obsahu ostáva obsah poľa "devices" prázdny)

```json
{
    "status": "...",
    "devices": []
}
```

### Zrýchlené získanie zariadení

*Zjednodušený zápis GET požiadavky pre získanie zoznamu konkrétneho typu zariadení*

**Definícia**

`GET /devices/<typ>`

| Typ zariadenia | Popis |
|:----------|:-------|
| `thermometers` | Vráti zoznam teplomerov |
| `humiditysensors` | Vráti zoznam senzorov vlhkosti |
| `lightsensors` | Vráti zoznam svetelných senzorov |
| `lamps` | Vráti zoznam lámp |

**Odpoveď**

- `200 OK` ak aktualizácia prebehla úspešne

```json
{
    "status": "...",
    "devices": [
        {...},
        {...},
        ...
    ]
}
```

### Aktualizácia údajov zariadenia

**Definícia**

`PUT /devices`

**Obsah tela**

Rovnaký ako pri [vytváraní nového zariadenia](###Registrovanie-nového-zariadenia)
V tele je potrebné uviesť navyše položku *token* upravovaného zariadenia!

```json
{
    "token": "...",
    ...
}
```

**Odpoveď**

- `200 OK` ak aktualizácia prebehla úspešne
- `400 Bad Request` ak chýba telo požiadavky alebo token
- `404 Not Found` ak zariadenie neexistuje
- `500 Internal Server Error`

```json
{
    "status": "...",
    ...
}
```

JSON odpoveď je objekt aktualizovaného zariadenia. Podobne ako objekty v *devices* pri požiadavke `GET /devices`

### Odstránenie zariadenia

**Definícia**

`DELETE /devices`

**Obsah tela**

V tele požiadavky je potrebné uviesť token mazaného zariadenia!
```json
{
    "token": "..."
}
```

**Odpoveď**

- `200 OK` ak bolo zariadenie úspešne odstránené
- `400 Bad Request` ak nebol uvedený token
- `404 Not Found` ak požadované zariadenie neexistuje
- `500 Internal Server Error`

```json
{
    "status": "...",
    "message": "..."
}
```

## Dáta (Data)

### Zapísanie dát do databázy

**Definícia**

`POST /data/<token>`

**Obsah tela**

Obsah sa môže líšiť podľa zariadenia! API rozhoduje ako dáta formovať podľa typu zariadenia.

(1) Thermometer a lightSensor

| Atribút   |      Typ      |  Pozn. |
|:----------|:-------------|:------|
| `value`* |  number | Nameraná hodnota |

*Podpora zariadení bude rozširovaná priebežne*

**Odpoveď**

- `201 Created` ak zápis prebehol úspešne
- `400 Bad Request` ak v tele alebo požiadavke chýba povinná hodnota alebo bola chybne uvedená
- `404 Not Found` ak token zariadenia nie je platný resp. zariadenie neexistuje
- `500 Internal Server Error`

```json
{
    "status": "...",
    "data": {}
}
```

### Získanie dát

#### Podľa tokenu zariadenia

**Definícia**

`GET /data/:token`

**Filter**

Dáta je možné taktiež filtrovať aj podľa UNIX Timestamp-u (v sekundách) pomocou parametrov `startDate` a `endDate`. 
Napríklad:
- `GET /data/:token?startDate=1615049433`
    - Dáta ktoré boli namerané od príslušného dátumu/času
- `GET /data/:token?startDate=X&endDate=Y`
    - Dáta boli namerané od X do Y

**Odpoveď**

- `200 OK` ak požiadavka prebehla úspešne
- `400 Bad Request` ak nebol zadaný žiadny token
- `404 Not Found` ak bol použitý nesprávny token resp. zariadenie neexistuje

JSON objekt
*Príklad JSON odpovedi na požiadavku získania dát z teplomera. Dáta v odpovede sa líšia na základe filtrovaného zariadenia*
```json
{
    "status": "...",
    "data": {
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

- `200 OK` ak požiadavka prebehla úspešne
- `400 Bad Request` ak bol zle špecifikovaný filter resp. neboli uvedené žiadne parametre
- `404 Not Found` ak neexistuje žiadne zariadenie vyhovujúce požiadavkám

```json
{
    "status": "...",
    "data": [
        {
            "device": {},
            "data": []
        }
    ]
}
```

JSON objekt je podobný ako u [požiadavky na základe tokenu](####Podľa-tokenu-zariadenia)

### Získanie jedného záznamu
**Definícia**

`GET /data/:token>/:id>`

**Parametre**

| Parameter   |      Typ      |  Pozn. |
|:----------|:-------------|:------|
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
    "status": "...",
    "data": {
        "id": String,
        "value": Number,
        "timestamp": Number
    }
}
```

### Úprava dát
**Definícia**

`PUT /data/:id`

**Parametre**

| Parameter   |      Typ      |  Pozn. |
|:----------|:-------------|:------|
| `id`* | string | Identifikátor záznamu dát |

**Obsah tela**

| Parameter   |      Typ      |  Pozn. |
|:----------|:-------------|:------|
| `token`* | string | Identifikátor zariadenia |
| `value` |  number | Nová hodnota záznamu |
| `timestamp` |  number | UNIX timestamp od (v sekundách) |

```json
{
    "token": "...",
    ...
}
```

**Odpoveď**
- `200 OK` ak požiadavka prebehla úspešne
- `400 Bad Request` ak v požiadavke chýba niektorý z povinných údajov
- `404 Not Found` ak zariadenie zodpovedajúce tokenu neexistuje
- `500 Internal Server Error`

```json
{
    "status": "...",
    "message": "..."
}
```

### Mazanie dát
**Definícia**

Dáta je možne mazať dvoma spôsobmi:

1. Podľa ID

`DELETE /data?id=X`

2. Podľa časového rozpätia

`DELETE /data?startDate=X&endDate=X`

**Parametre**

| Parameter   |      Typ      |  Popis |
|:----------|:-------------|:------|
| `id` |  number | ID dátového záznamu |
| `startDate` |  number | UNIX timestamp od (v sekundách) |
| `endDate` |  number | UNIX timestamp do (v sekundách) |

**Obsah tela**

| Parameter   |      Typ      |  Popis |
|:----------|:-------------|:------|
| `token`* |  string | Identifikátor zariadenia |

```json
{
    "token": "..."
}
```

**Odpoveď**
- `200 No Content` ak bola požiadavka úspešná a požadované záznamy boli zmazané
- `400 Bad Request` ak chýba niektorý z povinných údajov v požiadavke
- `404 Not Found` ak neexistuje zariadenie zodpovedajúce tokenu
- `500 Internal Server Error`

```json
{
    "status": "...",
    "message": "..."
}
```

### Získanie stavu lampy

**Definícia**

`GET /data/lamp/:token`

**Parametre**

| Parameter   |      Typ      |  Popis |
|:----------|:-------------|:------|
| `token`* |  string | Identifikátor zariadenia |

**Odpoveď**
- `200 OK` ak bola požiadavka úspešne úspešná
- `400 Bad Request` ak chýba povinný údaj v požiadavke
- `500 Internal Server Error`

JSON objekt
```json
{
    "status": "...",
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
|:----------|:-------------|:------|
| `token`* |  string | Identifikačný token zariadenia |
| `isOn` |  bool | Stav lampy |
| `hue` |  number | Hodnota odtieňu svetla |
| `sat` |  number | Saturácia svetla |
| `brightness` |  number | Jas svetla |

```json
{
    "token": "...",
    ...
}
```

**Odpoveď**
- `200 OK` ak požiadavka prebehla úspešne
- `400 Bad Request` ak chýba povinný údaj v požiadavke
- `500 Internal Servero Error`

```json
{
    "status": "...",
    "data": {
        "isOn": ...
        ...
    }
}
```



