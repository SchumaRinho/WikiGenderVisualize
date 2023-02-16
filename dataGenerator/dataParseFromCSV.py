import pandas as pd
import pycountry as pc
import json

def specialCountries(country): #On fais des appellation particulière pour certains pays (changement de nom en fonction de l'epoque ou nom different entre la bdd et la lib pycountry)
    match country:
        case "COD":
            return df[df["Country"].str.contains("Democratic Republic of the Congo")]
        case "COG":
            return df[(df["Country"].str.contains("Republic of the Congo")) & (~df["Country"].str.contains("Democratic"))]
        case "MNG":
            return df[(df["Country"].str.contains("Mongol")) | (df["Country"].str.contains("Liao dynasty")) | (df["Country"].str.contains("Yuan dynasty"))]     
        case "CHN":
            return df[(df["Country"].str.contains("China")) | (df["Country"].str.contains("Han Dynasty")) | (df["Country"].str.contains("Song Dynasty")) | (df["Country"].str.contains("Tang Dynasty")) | (df["Country"].str.contains("Qing dynasty")) | (df["Country"].str.contains("Jin dynasty")) | (df["Country"].str.contains("Ming dynasty")) | (df["Country"].str.contains("Cao Wei"))]                         
        case "RUS":
            return df[(df["Country"].str.contains("Russia")) | (df["Country"].str.contains("Soviet"))]             
        case "DEU":
            return df[(df["Country"].str.contains("Germany")) | (df["Country"].str.contains("Prussia"))]                         
        case "ITA":
            return df[(df["Country"].str.contains("Italy")) | (df["Country"].str.contains("Roman")) | (df["Country"].str.contains("ancient Rome"))]         
        case "ESP":
            return df[(df["Country"].str.contains("Spain")) | (df["Country"].str.contains("Crown of Aragón")) | (df["Country"].str.contains("Kingdom of Castile"))]                     
        case "FRA":
            return df[(df["Country"].str.contains("France")) | (df["Country"].str.contains("Navarre")) | (df["Country"].str.contains("French")) | (df["Country"].str.contains("Brittany")) | (df["Country"].str.contains("Burgundy"))]                
        case "NLD":
            return df[(df["Country"].str.contains("Netherland")) | (df["Country"].str.contains("Dutch"))]            
        case "TUR":
            return df[(df["Country"].str.contains("Turkey")) | (df["Country"].str.contains("Ottoman")) | (df["Country"].str.contains("Byzantin")) | (df["Country"].str.contains("Seleucid"))]              
        case "SYR":
            return df[(df["Country"].str.contains("Syria")) | (df["Country"].str.contains("United Arab Republic"))]                         
        case "IRN":
            return df[(df["Country"].str.contains("Iran")) | (df["Country"].str.contains("Achaemenid"))]     
        case "GRC":
            return df[(df["Country"].str.contains("Greece")) | (df["Country"].str.contains("Athens"))]                         
        case "IRQ":
            return df[(df["Country"].str.contains("Iraq")) | (df["Country"].str.contains("Seleucid"))]                         
        case "TUN":
            return df[(df["Country"].str.contains("Tunisia")) | (df["Country"].str.contains("Carthage"))]                         
        case "MKD":
            return df[(df["Country"].str.contains("Macedonia")) | (df["Country"].str.contains("Ptolemaic"))]                 
        case "EGY":
            return df[(df["Country"].str.contains("Egypt")) | (df["Country"].str.contains("Ptolemaic"))]                 
        case "PRK":
            return df[(df["Country"].str.contains("North Korea")) | (df["Country"].str.contains("Goguryeo")) | (df["Country"].str.contains("Korean Empire")) | (df["Country"].str.contains("Joseon"))]               
        case "KOR":
            return df[(df["Country"].str.contains("South Korea")) | (df["Country"].str.contains("Korean Empire")) | (df["Country"].str.contains("Joseon"))]
        case "BOL":
            return df[df["Country"].str.contains("Bolivia")]
        case "VEN":
            return df[df["Country"].str.contains("Venezuela")]
        case "LAO":
            return df[df["Country"].str.contains("Laos")]
        case "CZE":
            return df[df["Country"].str.contains("Czech")]
        case "TZA":
            return df[df["Country"].str.contains("Tanzania")]
        case "TWN":
            return df[df["Country"].str.contains("Taiwan")]
        case "VNM":
            return df[df["Country"].str.contains("Vietnam")]
        case "MDA":
            return df[df["Country"].str.contains("Moldova")]
        case "CIV":
            return df[df["Country"].str.contains("Ivory Coast")]
        case _:
            return 0

def politicianStat(df): #On récupère le nombre de femme et d'homme politicien(ne) dans le pays en question 
    politician = df[df["Occupation"] == 'Politician'].Gender.tolist() 
    return [politician.count("Male"),politician.count("Female")]

def artistStat(df): #On récupère le nombre de femme et d'homme artiste dans le pays en question
    artist = df[df["Occupation"] == 'Artist'].Gender.tolist() 
    return [artist.count("Male"),artist.count("Female")]


print("Lecture des fichiers ... ")

countryList = pc.countries #On récupère une liste de pays
df = pd.read_csv('externDataset.csv')
df.drop(["Name", "Death year", "Short description", "Manner of death", "Age of death"], axis = 1, inplace = True) #On retire les lignes inutiles
df = df.dropna(subset=['Country', 'Birth year', "Gender"]) #On retire les lignes où il nous manque des infos 


print("Génération des données en cours...")            

jsonOverall,jsonPolitician,jsonArtist = ([], [], [])

for j in range(len(countryList)):

    if j%10 == 0:
        print(str(j)+"/"+str(len(countryList))) #Indicateur d'avancement de la génération des datas
        
    dicoOverall, dicoPolitician, dicoArtist = ({}, {}, {})

    c = list(countryList)[j]
    dicoOverall["id"],dicoPolitician["id"],dicoArtist["id"] = (c.alpha_3, c.alpha_3, c.alpha_3) #On inscrit l'id du pays (en 3 lettres) dans le champ id des dicos
    dicoOverall["name"],dicoPolitician["name"],dicoArtist["name"] = (c.name, c.name, c.name) #Idem mais pour le nom

    info = specialCountries(c.alpha_3)#On vérifie si le pays fait partie des pays spéciaux
    if type(info) == int :
        info = df[df["Country"].str.contains(c.name)] #Sinon on prend son nom comme il est dans la librairie pycountry

    i=0
    
    while i<=2000:
        
        century = info[info['Birth year'] <= i] #On récuère tous les personamités né avant le siècle que l'on traite

        dicoPolitician[str(i)] = politicianStat(century)
        dicoArtist[str(i)] = artistStat(century)
        
        gender = century.Gender.tolist()#On récupère tous les sexes présent et on les met sous forme de liste pour les compter plus facilement
        dicoOverall[str(i)] = [gender.count("Male"),gender.count("Female"),gender.count("Transgender Female") + gender.count("Transgender Male"),gender.count("Non-Binary")]
        i+=100 #+100 car on veut récupérer les données par siècle

    # On met les dicos dans leur json correspondant     
    jsonOverall.append(dicoOverall)
    jsonPolitician.append(dicoPolitician)
    jsonArtist.append(dicoArtist)

print("Création des fichiers json...")

#On rentre les datas dans les fichiers correpondant et on utilise la lib json pour indenter automatiquement les données au format JSON
# !!!!!!!!!! ATTENTION !!!!!!!!!! - Les données contenu dans les fichiers seront supprimés
    
file = open("overallData.json","w")
file.write(json.dumps(jsonOverall, indent=4))
file.close()

file = open("politicanData.json","w")
file.write(json.dumps(jsonPolitician, indent=4))
file.close()    

file = open("artistData.json","w")
file.write(json.dumps(jsonArtist, indent=4))
file.close()
    

