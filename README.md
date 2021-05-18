# API Dokumentácia
## Implementácia API rozhrania IoT zariadení s využitím nerelačných databáz

## Základné informácie

### Identifikátor
Každé zariadenia je identifikovateľné pomocou unikátneho **identifikátora**, ktorý sa v systém označuje ako `token`. Tento identifikátor je nemenný a je vyžadovaný pri niektorých akciách, ktoré sú cielené na prácu s konkrétnym zariadením.

### Odpovede
Každá odpoveď resp. telo odpovede - ak nie je uvedené inak - je vo formáte **JSON**. Každá odpoveď obsahuje v tele položku `status`, ktorá môže nadobudnúť hodnotu ’*OK*’ alebo ’*Failed*’ na základe úspešnosti požiadavky. V prípade niektorých odpovedí (zvyčajne chybových hlášok) je možné v tele odpovede nájsť aj položku `message`, ktorá bližšie popisuje príčinu danej odpovede.

### Požiadavky
V prípade niektorých požiadaviek je povolené použiť **dopyt** (query) v adrese požiadavky. Rozhranie taktiež využíva údaje v tele požiadavky.

### Časové údaje
V prípade časových údajov (v odpovedi alebo v požiadavkách) sa jedná o **UNIX Časové známky** (UNIX Timestamp)

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

Ukážka obsahu tela požiadavky:

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

Ukážka JSON odpovede:

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

Ukážka JSON odpovede:

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

Ukážka JSON odpovede:

```json
{
    "status": "...",
    "devices": []
}
```

### Zrýchlené získanie zariadení

*Zjednodušený zápis GET požiadavky pre získanie zoznamu konkrétneho typu zariadení*

**Definícia**

`GET /devices/:typ`

| Typ zariadenia | Popis |
|:----------|:-------|
| `thermometers` | Vráti zoznam teplomerov |
| `humiditysensors` | Vráti zoznam senzorov vlhkosti |
| `lightsensors` | Vráti zoznam svetelných senzorov |
| `lamps` | Vráti zoznam lámp |

**Odpoveď**

- `200 OK` ak požiadavka prebehla úspešne.

Ukážka JSON odpovede:

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

Ukážka tela požiadavky:

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

Ukážka JSON odpovede:

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

V tele požiadavky je potrebné uviesť token odstraňovaného zariadenia!
Ukážka tela požiadavky:

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

Ukážka JSON odpovede:

```json
{
    "status": "...",
    "message": "..."
}
```

## Dáta (Data)

### Zapísanie dát do databázy

**Definícia**

`POST /data/:token`

**Obsah tela**

Obsah sa môže líšiť podľa zariadenia! API rozhoduje ako dáta formovať podľa typu zariadenia.

(1) Thermometer a lightSensor

| Atribút   |      Typ      |  Pozn. |
|:----------|:-------------|:------|
| `value`* |  number | Nameraná hodnota |

*Podpora zariadení bude rozširovaná priebežne*

**Odpoveď**

- `201 Created` ak zápis prebehol úspešne
- `400 Bad Request` ak v tele alebo požiadavke chýba povinná hodnota alebo bola hodnota chybne uvedená
- `404 Not Found` ak token zariadenia nie je platný resp. zariadenie neexistuje
- `500 Internal Server Error`

Ukážka JSON odpovede:

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
    - Vráti dáta, ktoré boli namerané od príslušného dátumu/času až po súčasnosť.
- `GET /data/:token?startDate=X&endDate=Y`
    - Vráti dáta, ktoré boli namerané medzi časom X a Y

**Odpoveď**

- `200 OK` ak požiadavka prebehla úspešne
- `400 Bad Request` ak nebol zadaný žiadny token
- `404 Not Found` ak bol použitý nesprávny token resp. zariadenie neexistuje
- `500 Internal Server Error`

*Ukážka JSON odpovedi na požiadavku získania dát z teplomera. Dáta v odpovede sa líšia na základe filtrovaného zariadenia*
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

Všetky valídne parametre zariadenia.

Taktiež je možné použiť parametre `startDate` a `endDate` s UNIX timestamp hodnotou (v sekundách) pre podrobnejšie filtrovanie podľa času a dátumu. (viď. [požiadavka na základe tokenu](###Podľa-tokenu-zariadenia))

**Odpoveď**

- `200 OK` ak požiadavka prebehla úspešne
- `400 Bad Request` ak bol zle špecifikovaný filter resp. neboli uvedené žiadne parametre
- `404 Not Found` ak neexistuje žiadne zariadenie vyhovujúce požiadavkám

Ukážka JSON odpovede:

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

`GET /data/:token/:id`

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

Ukážka JSON odpovede: (Dáta sa môžu líšiť podľa typu zariadenia)
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

Obsah sa môže líšiť podľa typu zariadenia.
(1) Thermometer, lightsensor, humiditysensor

| Parameter   |      Typ      |  Pozn. |
|:----------|:-------------|:------|
| `token`* | string | Identifikátor zariadenia |
| `value` |  number | Nová hodnota záznamu |
| `timestamp` |  number | UNIX timestamp od (v sekundách) |

Ukážka tela požiadavky:

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

Ukážka JSON odpovede:

```json
{
    "status": "...",
    "message": "..."
}
```

### Odstránenie záznamu dát
**Definícia**

Záznamy dát je možne odstrániť dvoma spôsobmi:

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

Ukážka tela požiadavky:

```json
{
    "token": "..."
}
```

**Odpoveď**
- `200 No Content` ak bola požiadavka úspešná a požadované záznamy boli odstránené
- `400 Bad Request` ak chýba niektorý z povinných údajov v požiadavke
- `404 Not Found` ak neexistuje zariadenie zodpovedajúce tokenu
- `500 Internal Server Error`

Ukážka JSON odpovede:

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

Ukážka JSON odpovede:
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

Ukážka tela požiadavky:

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

Ukážka JSON odpovede:

```json
{
    "status": "...",
    "data": {
        "isOn": ...
        ...
    }
}
```



