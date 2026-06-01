import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const E = [
{i:'410259',d:'CC',n:'1032487527',a1:'Contreras',a2:'Yance',ap:'Contreras Yance',n1:'Juan',n2:'Pablo',nm:'Juan Pablo',g:'M',t:'3197268303',c:'juan.contrerasy@campusucc.edu.co',e:'SANITAS EPS',h:'DIUR',l:'10S'},
{i:'890837',d:'CC',n:'1003630898',a1:'Prieto',a2:'Cubides',ap:'Prieto Cubides',n1:'Danna',n2:'Alexandra',nm:'Danna Alexandra',g:'F',t:'3222806613',c:'danna.prieto@campusucc.edu.co',e:'SALUD TOTAL',h:'MNOC',l:'7S'},
{i:'891502',d:'CC',n:'1116070809',a1:'Lozano',a2:'Clavijo',ap:'Lozano Clavijo',n1:'Francisco',n2:'Javier',nm:'Francisco Javier',g:'M',t:'3145795529',c:'francisco.lozano@campusucc.edu.co',e:'FAMISANAR EPS',h:'MNOC',l:'7S'},
{i:'518205',d:'CC',n:'1018495100',a1:'Ospina',a2:'Villalobos',ap:'Ospina Villalobos',n1:'Jereth',n2:'Daniela',nm:'Jereth Daniela',g:'F',t:'3208580809',c:'jereth.ospina@campusucc.edu.co',e:'SANITAS EPS',h:'MNOC',l:'9S'},
{i:'933308',d:'TI',n:'1030572059',a1:'Beltran',a2:'Fernandez',ap:'Beltran Fernandez',n1:'Juliana',n2:'',nm:'Juliana',g:'F',t:'3162326322',c:'juliana.beltranfe@campusucc.edu.co',e:'ALIANSALUD',h:'DIUR',l:'4S'},
{i:'913062',d:'CC',n:'1069476085',a1:'Santos',a2:'Arguello',ap:'Santos Arguello',n1:'Kewen',n2:'Andres',nm:'Kewen Andres',g:'M',t:'3132558156',c:'kewen.santos@campusucc.edu.co',e:'LA NUEVA EPS',h:'DIUR',l:'6S'},
{i:'823477',d:'CC',n:'1030666758',a1:'Martinez',a2:'Vargas',ap:'Martinez Vargas',n1:'Daniela',n2:'',nm:'Daniela',g:'F',t:'3013383543',c:'daniela.martinezva@campusucc.edu.co',e:'COLMENA',h:'MNOC',l:'7S'},
{i:'546728',d:'TI',n:'1000383013',a1:'Parra',a2:'Rios',ap:'Parra Rios',n1:'Nycoll',n2:'Valentina',nm:'Nycoll Valentina',g:'F',t:'3057153243',c:'nycoll.parra@campusucc.edu.co',e:'COMPESAR EPS',h:'DIUR',l:'6S'},
{i:'823267',d:'CC',n:'1032461496',a1:'Bustamante',a2:'Henao',ap:'Bustamante Henao',n1:'Maryeli',n2:'',nm:'Maryeli',g:'F',t:'3144393636',c:'maryeli.bustamante@campusucc.edu.co',e:'COMPESAR EPS',h:'DIUR',l:'8S'},
{i:'922984',d:'CC',n:'1031180885',a1:'Arenas',a2:'Carvajal',ap:'Arenas Carvajal',n1:'Wendy',n2:'Daniela',nm:'Wendy Daniela',g:'F',t:'3104567821',c:'wendy.arenas@campusucc.edu.co',e:'FAMISANAR EPS',h:'MNOC',l:'4S'},
{i:'826280',d:'CC',n:'1115721760',a1:'Acevedo',a2:'Paez',ap:'Acevedo Paez',n1:'Brayan',n2:'Esneider',nm:'Brayan Esneider',g:'M',t:'3223367205',c:'brayan.acevedo@campusucc.edu.co',e:'LA NUEVA EPS',h:'DIUR',l:'5S'},
{i:'834298',d:'CC',n:'1010060714',a1:'Gutierrez',a2:'Hernandez',ap:'Gutierrez Hernandez',n1:'Cristhian',n2:'Camilo',nm:'Cristhian Camilo',g:'M',t:'3114801986',c:'cristhian.gutierrezh@campusucc.edu.co',e:'SURA',h:'MNOC',l:'9S'},
{i:'544910',d:'CC',n:'1026280786',a1:'Alvarado',a2:'Leon',ap:'Alvarado Leon',n1:'Pablo',n2:'Andres',nm:'Pablo Andres',g:'M',t:'3143529366',c:'pablo.alvaradoleo@campusucc.edu.co',e:'SANITAS EPS',h:'MNOC',l:'10S'},
{i:'864145',d:'CC',n:'1022932902',a1:'Toloza',a2:'Amaya',ap:'Toloza Amaya',n1:'Valerin',n2:'',nm:'Valerin',g:'F',t:'3243092315',c:'valerin.toloza@campusucc.edu.co',e:'SURA',h:'DIUR',l:'7S'},
{i:'913248',d:'CC',n:'1141114792',a1:'Martinez',a2:'Escorcia',ap:'Martinez Escorcia',n1:'Danna',n2:'Michel',nm:'Danna Michel',g:'F',t:'3243205226',c:'danna.martineze@campusucc.edu.co',e:'SALUD TOTAL',h:'DIUR',l:'6S'},
{i:'753480',d:'CC',n:'1073609018',a1:'Gordillo',a2:'Gomez',ap:'Gordillo Gomez',n1:'Miguel',n2:'Angel',nm:'Miguel Angel',g:'M',t:'3053812097',c:'miguel.gordillo@campusucc.edu.co',e:'CONVIDA EPS',h:'MNOC',l:'10S'},
{i:'836932',d:'CC',n:'1021398048',a1:'Santamaria',a2:'Cardenas',ap:'Santamaria Cardenas',n1:'Carol',n2:'Natalia',nm:'Carol Natalia',g:'F',t:'3107690915',c:'carol.santamaria@campusucc.edu.co',e:'COMPESAR EPS',h:'DIUR',l:'5S'},
{i:'217893',d:'CC',n:'1010195480',a1:'Sierra',a2:'Miranda',ap:'Sierra Miranda',n1:'Edwin',n2:'David',nm:'Edwin David',g:'M',t:'3152798485',c:'edwind.sierra@campusucc.edu.co',e:'COMPESAR EPS',h:'MNOC',l:'10S'},
{i:'823051',d:'CC',n:'1105780253',a1:'Gomez',a2:'Garcia',ap:'Gomez Garcia',n1:'Sofia',n2:'',nm:'Sofia',g:'F',t:'3143037258',c:'sofia.gomezg@campusucc.edu.co',e:'SANITAS EPS',h:'DIUR',l:'9S'},
{i:'939419',d:'CC',n:'1131459000',a1:'Lastra',a2:'Paez',ap:'Lastra Paez',n1:'Fredys',n2:'Freys',nm:'Fredys Freys',g:'M',t:'3209940548',c:'fredys.lastra@campusucc.edu.co',e:'SALUD TOTAL',h:'DIUR',l:'3S'},
{i:'805162',d:'CC',n:'1192776524',a1:'Perez',a2:'Gama',ap:'Perez Gama',n1:'Luisa',n2:'Daniela',nm:'Luisa Daniela',g:'F',t:'3142690677',c:'luisad.perez@campusucc.edu.co',e:'COMPESAR EPS',h:'DIUR',l:'9S'},
{i:'752880',d:'CC',n:'1030679402',a1:'Wilches',a2:'Diaz',ap:'Wilches Diaz',n1:'Heidy',n2:'Tatiana',nm:'Heidy Tatiana',g:'F',t:'3202699359',c:'heidy.wilches@campusucc.edu.co',e:'SANITAS EPS',h:'DIUR',l:'9S'},
{i:'797768',d:'CC',n:'1007525263',a1:'Marin',a2:'Urriago',ap:'Marin Urriago',n1:'Brayan',n2:'Alexis',nm:'Brayan Alexis',g:'M',t:'3102188432',c:'brayan.marin@campusucc.edu.co',e:'SANITAS EPS',h:'DIUR',l:'10S'},
{i:'924293',d:'CC',n:'1003739358',a1:'Mora',a2:'Aya',ap:'Mora Aya',n1:'Luisa',n2:'Fernanda',nm:'Luisa Fernanda',g:'F',t:'3015765844',c:'luisa.moraa@campusucc.edu.co',e:'LA NUEVA EPS',h:'MNOC',l:'8S'},
{i:'914864',d:'CC',n:'1000156363',a1:'Gomez',a2:'Saavedra',ap:'Gomez Saavedra',n1:'Julieth',n2:'Alejandra',nm:'Julieth Alejandra',g:'F',t:'3112968884',c:'julieth.gomezs@campusucc.edu.co',e:'SALUD TOTAL',h:'MNOC',l:'5S'},
{i:'886670',d:'CC',n:'1025529671',a1:'Prada',a2:'Nunez',ap:'Prada Nunez',n1:'Ivan',n2:'Camilo',nm:'Ivan Camilo',g:'M',t:'3202550034',c:'ivan.prada@campusucc.edu.co',e:'COMPESAR EPS',h:'DIUR',l:'2S'},
{i:'914337',d:'CC',n:'1010236248',a1:'Garay',a2:'Medina',ap:'Garay Medina',n1:'Yessica',n2:'Alejandra',nm:'Yessica Alejandra',g:'F',t:'3013423225',c:'yessica.garay@campusucc.edu.co',e:'FAMISANAR EPS',h:'MNOC',l:'6S'},
{i:'891531',d:'CC',n:'1130164069',a1:'Ordonez',a2:'Melo',ap:'Ordonez Melo',n1:'Carol',n2:'Tatiana',nm:'Carol Tatiana',g:'F',t:'3107951764',c:'carol.ordonez@campusucc.edu.co',e:'SANITAS EPS',h:'MNOC',l:'7S'},
{i:'823255',d:'CC',n:'1193574605',a1:'Gamez',a2:'Vanegas',ap:'Gamez Vanegas',n1:'Karen',n2:'Dayana',nm:'Karen Dayana',g:'F',t:'3502762354',c:'karen.gamez@campusucc.edu.co',e:'SANITAS EPS',h:'MNOC',l:'8S'},
{i:'809246',d:'CC',n:'1032484041',a1:'Forero',a2:'Sanchez',ap:'Forero Sanchez',n1:'Julieth',n2:'Stephani',nm:'Julieth Stephani',g:'F',t:'3227853315',c:'julieth.forerof@campusucc.edu.co',e:'FAMISANAR EPS',h:'MNOC',l:'8S'},
{i:'760757',d:'CC',n:'1033770707',a1:'Contreras',a2:'Martinez',ap:'Contreras Martinez',n1:'Brayan',n2:'Yusepp',nm:'Brayan Yusepp',g:'M',t:'3135037703',c:'brayan.contrerasm@campusucc.edu.co',e:'COLSUBSIDIO',h:'DIUR',l:'9S'},
{i:'792208',d:'CC',n:'1030654236',a1:'Quintero',a2:'Paez',ap:'Quintero Paez',n1:'Maria',n2:'Alejandra',nm:'Maria Alejandra',g:'F',t:'3203377910',c:'maria.quinteropaez@campusucc.edu.co',e:'SURA',h:'MNOC',l:'10S'},
{i:'891522',d:'CC',n:'1033808218',a1:'Ruiz',a2:'Carrillo',ap:'Ruiz Carrillo',n1:'Katerin',n2:'Sofia',nm:'Katerin Sofia',g:'F',t:'3145651898',c:'katerin.ruiz@campusucc.edu.co',e:'SALUD TOTAL',h:'MNOC',l:'6S'},
{i:'314454',d:'CC',n:'1032422902',a1:'Murcia',a2:'Alvarez',ap:'Murcia Alvarez',n1:'Yuli',n2:'Milena',nm:'Yuli Milena',g:'F',t:'3219500745',c:'yuli.murcia@campusucc.edu.co',e:'SANITAS EPS',h:'MNOC',l:'9S'},
{i:'797275',d:'CC',n:'1084866075',a1:'Anacona',a2:'Castro',ap:'Anacona Castro',n1:'Jorge',n2:'Mario',nm:'Jorge Mario',g:'M',t:'3114735548',c:'jorge.anacona@campusucc.edu.co',e:'SANITAS EPS',h:'MNOC',l:'10S'},
{i:'508741',d:'TI',n:'1001086068',a1:'Rios',a2:'Ramirez',ap:'Rios Ramirez',n1:'Maria',n2:'Fernanda',nm:'Maria Fernanda',g:'F',t:'3022977511',c:'mariaf.riosra@campusucc.edu.co',e:'COMPESAR EPS',h:'DIUR',l:'10S'},
{i:'853014',d:'CC',n:'1062431039',a1:'Florez',a2:'Olarte',ap:'Florez Olarte',n1:'Laura',n2:'Lorena',nm:'Laura Lorena',g:'F',t:'3197593671',c:'laura.florezol@campusucc.edu.co',e:'SANIDAD MILITAR',h:'DIUR',l:'8S'},
{i:'891497',d:'CC',n:'1000336284',a1:'Ramos',a2:'Aragon',ap:'Ramos Aragon',n1:'Angie',n2:'Lorena',nm:'Angie Lorena',g:'F',t:'3125340580',c:'angie.ramosa@campusucc.edu.co',e:'COLSUBSIDIO',h:'DIUR',l:'6S'},
{i:'809256',d:'CC',n:'1016592042',a1:'Sandoval',a2:'Bonilla',ap:'Sandoval Bonilla',n1:'Yeimy',n2:'Katherin',nm:'Yeimy Katherin',g:'F',t:'3114876989',c:'yeimy.sandovalb@campusucc.edu.co',e:'FAMISANAR EPS',h:'DIUR',l:'10S'},
{i:'822742',d:'CC',n:'1026550768',a1:'Canro',a2:'Montoya',ap:'Canro Montoya',n1:'Lenith',n2:'Sofia',nm:'Lenith Sofia',g:'F',t:'3105642575',c:'lenith.canro@campusucc.edu.co',e:'COMPESAR EPS',h:'DIUR',l:'9S'},
{i:'852975',d:'PPT',n:'1286451',a1:'Perozo',a2:'Del Valle',ap:'Perozo Del Valle',n1:'Yedoska',n2:'',nm:'Yedoska',g:'F',t:'3007785881',c:'yedoska.perozo@campusucc.edu.co',e:'CAPITAL SALUD',h:'DIUR',l:'7S'},
{i:'939383',d:'CC',n:'1233505768',a1:'Martinez',a2:'Yampuezan',ap:'Martinez Yampuezan',n1:'Lisbeth',n2:'Yulieth',nm:'Lisbeth Yulieth',g:'F',t:'3043949381',c:'lisbeth.martinezy@campusucc.edu.co',e:'LA NUEVA EPS',h:'MNOC',l:'3S'},
{i:'818844',d:'CC',n:'1076502074',a1:'Rivera',a2:'Beltran',ap:'Rivera Beltran',n1:'Laura',n2:'Catalina',nm:'Laura Catalina',g:'F',t:'3157075457',c:'laura.riverabel@campusucc.edu.co',e:'LA NUEVA EPS',h:'DIUR',l:'9S'},
{i:'484096',d:'CC',n:'1073248615',a1:'Gutierrez',a2:'Mendez',ap:'Gutierrez Mendez',n1:'Catherine',n2:'',nm:'Catherine',g:'F',t:'3148338123',c:'catherine.gutierrezm@campusucc.edu.co',e:'COMPESAR EPS',h:'DIUR',l:'10S'},
{i:'431189',d:'CC',n:'1032486912',a1:'Rodriguez',a2:'Carrascal',ap:'Rodriguez Carrascal',n1:'Nicol',n2:'Juliana',nm:'Nicol Juliana',g:'F',t:'3208193603',c:'nicol.rodriguezc@campusucc.edu.co',e:'COLSUBSIDIO',h:'MNOC',l:'8S'},
{i:'852781',d:'CC',n:'1013108878',a1:'Jerez',a2:'Diaz',ap:'Jerez Diaz',n1:'David',n2:'Stiven',nm:'David Stiven',g:'M',t:'3228453115',c:'david.jerezd@campusucc.edu.co',e:'SANITAS EPS',h:'DIUR',l:'8S'},
{i:'807948',d:'CC',n:'1000856006',a1:'Gayon',a2:'Romero',ap:'Gayon Romero',n1:'Natalia',n2:'',nm:'Natalia',g:'F',t:'3125424198',c:'natalia.gayon@campusucc.edu.co',e:'FAMISANAR EPS',h:'DIUR',l:'10S'},
{i:'947415',d:'CC',n:'1105464984',a1:'Torres',a2:'Aragon',ap:'Torres Aragon',n1:'Manuel',n2:'Felipe',nm:'Manuel Felipe',g:'M',t:'3229572388',c:'manuel.torresa@campusucc.edu.co',e:'SANITAS EPS',h:'MNOC',l:'4S'},
{i:'769564',d:'CC',n:'1007519614',a1:'Rodriguez',a2:'Santiesteban',ap:'Rodriguez Santiesteban',n1:'Laura',n2:'Maria',nm:'Laura Maria',g:'F',t:'3187261296',c:'laura.rodriguezsan@campusucc.edu.co',e:'SANITAS EPS',h:'MNOC',l:'8S'},
{i:'524525',d:'CC',n:'1019090536',a1:'Castelblanco',a2:'',ap:'Castelblanco',n1:'Cristian',n2:'Santiago',nm:'Cristian Santiago',g:'M',t:'3202357296',c:'cristian.castelblanc@campusucc.edu.co',e:'FAMISANAR EPS',h:'DIUR',l:'8S'},
{i:'809820',d:'CC',n:'1024465321',a1:'Celis',a2:'Caicedo',ap:'Celis Caicedo',n1:'Wendy',n2:'Carolina',nm:'Wendy Carolina',g:'F',t:'3144346881',c:'wendy.celis@campusucc.edu.co',e:'LA NUEVA EPS',h:'DIUR',l:'8S'},
{i:'891498',d:'CC',n:'1012442769',a1:'Acosta',a2:'Bolano',ap:'Acosta Bolano',n1:'Alexander',n2:'Felipe',nm:'Alexander Felipe',g:'M',t:'3014207100',c:'alexander.acostab@campusucc.edu.co',e:'FAMISANAR EPS',h:'MNOC',l:'5S'},
{i:'797760',d:'CC',n:'1193591466',a1:'Guerrero',a2:'Ibarguen',ap:'Guerrero Ibarguen',n1:'Irene',n2:'',nm:'Irene',g:'F',t:'3117584472',c:'irene.guerreroib@campusucc.edu.co',e:'LA NUEVA EPS',h:'DIUR',l:'10S'},
{i:'759775',d:'CC',n:'1077444940',a1:'Palacios',a2:'Mosquera',ap:'Palacios Mosquera',n1:'Alexandra',n2:'',nm:'Alexandra',g:'F',t:'3106091970',c:'alexandra.palacios@campusucc.edu.co',e:'SANITAS EPS',h:'MNOC',l:'10S'},
{i:'852748',d:'CC',n:'1011086322',a1:'Leguizamon',a2:'Rodriguez',ap:'Leguizamon Rodriguez',n1:'Andres',n2:'Felipe',nm:'Andres Felipe',g:'M',t:'3024193626',c:'andres.leguizamonr@campusucc.edu.co',e:'SANITAS EPS',h:'DIUR',l:'8S'},
{i:'820613',d:'CC',n:'1073598907',a1:'Medina',a2:'Estrada',ap:'Medina Estrada',n1:'Mariana',n2:'',nm:'Mariana',g:'F',t:'3124930602',c:'mariana.medina@campusucc.edu.co',e:'CONVIDA EPS',h:'MNOC',l:'5S'},
{i:'940374',d:'TI',n:'1014991682',a1:'Cardozo',a2:'Gonzalez',ap:'Cardozo Gonzalez',n1:'Nicolas',n2:'Giovany',nm:'Nicolas Giovany',g:'M',t:'3144203174',c:'nicolas.cardozog@campusucc.edu.co',e:'SANITAS EPS',h:'DIUR',l:'3S'},
{i:'799126',d:'CC',n:'1007418319',a1:'Cortes',a2:'Molina',ap:'Cortes Molina',n1:'Juan',n2:'Guillermo',nm:'Juan Guillermo',g:'M',t:'3042073450',c:'juan.cortesmo@campusucc.edu.co',e:'SALUD TOTAL',h:'MNOC',l:'9S'},
{i:'940164',d:'CC',n:'1001285194',a1:'Solano',a2:'Mendez',ap:'Solano Mendez',n1:'Dora',n2:'Jasbleidy',nm:'Dora Jasbleidy',g:'F',t:'3203738963',c:'dora.solano@campusucc.edu.co',e:'CAPITAL SALUD',h:'MNOC',l:'3S'},
{i:'809577',d:'CC',n:'1000005489',a1:'Lugo',a2:'Mendoza',ap:'Lugo Mendoza',n1:'Queilen',n2:'Yulier',nm:'Queilen Yulier',g:'F',t:'3142486802',c:'queilen.lugo@campusucc.edu.co',e:'FAMISANAR EPS',h:'MNOC',l:'9S'},
{i:'893747',d:'CC',n:'1000974457',a1:'Molina',a2:'Barrera',ap:'Molina Barrera',n1:'Brayan',n2:'Steven',nm:'Brayan Steven',g:'M',t:'3103502939',c:'brayan.molina@campusucc.edu.co',e:'SALUD TOTAL',h:'MNOC',l:'7S'},
{i:'823180',d:'CC',n:'1015456442',a1:'Campos',a2:'Saboya',ap:'Campos Saboya',n1:'Lina',n2:'Jazmin',nm:'Lina Jazmin',g:'F',t:'3008290418',c:'lina.camposs@campusucc.edu.co',e:'SALUD TOTAL',h:'MNOC',l:'9S'},
{i:'922072',d:'CC',n:'1000791335',a1:'Zapata',a2:'Chica',ap:'Zapata Chica',n1:'Luz',n2:'Maria',nm:'Luz Maria',g:'F',t:'3209197544',c:'luz.zapatac@campusucc.edu.co',e:'SALUD TOTAL',h:'MNOC',l:'3S'},
{i:'929432',d:'CC',n:'1049412426',a1:'Colorado',a2:'Mora',ap:'Colorado Mora',n1:'Heidy',n2:'Lorena',nm:'Heidy Lorena',g:'F',t:'3214611135',c:'heidy.coloradom@campusucc.edu.co',e:'SANITAS EPS',h:'MNOC',l:'4S'},
{i:'834024',d:'CC',n:'1000590815',a1:'Amazo',a2:'Fagua',ap:'Amazo Fagua',n1:'Daniel',n2:'Alejandro',nm:'Daniel Alejandro',g:'M',t:'3232367974',c:'daniel.amazo@campusucc.edu.co',e:'SANITAS EPS',h:'MNOC',l:'9S'},
{i:'835783',d:'CC',n:'1049795086',a1:'Carranza',a2:'Juez',ap:'Carranza Juez',n1:'Daniel',n2:'Felipe',nm:'Daniel Felipe',g:'M',t:'3232060050',c:'daniel.carranza@campusucc.edu.co',e:'CAPITAL SALUD',h:'DIUR',l:'6S'},
{i:'412402',d:'CC',n:'1097666511',a1:'Garcia',a2:'Nieto',ap:'Garcia Nieto',n1:'Brayan',n2:'Yadir',nm:'Brayan Yadir',g:'M',t:'3228327853',c:'bryan.garcian@campusucc.edu.co',e:'OTRA',h:'MNOC',l:'9S'},
{i:'922738',d:'CC',n:'1025461857',a1:'Velasquez',a2:'Veloza',ap:'Velasquez Veloza',n1:'Carlos',n2:'Enrique',nm:'Carlos Enrique',g:'M',t:'3108062942',c:'carlos.velasquezv@campusucc.edu.co',e:'SALUD TOTAL',h:'DIUR',l:'5S'},
{i:'823247',d:'CC',n:'1024465207',a1:'Capera',a2:'Torres',ap:'Capera Torres',n1:'Ingrid',n2:'Lorena',nm:'Ingrid Lorena',g:'F',t:'3112527328',c:'ingrid.caperator@campusucc.edu.co',e:'FAMISANAR EPS',h:'MNOC',l:'5S'},
{i:'771593',d:'CC',n:'1085338829',a1:'Gamez',a2:'Achicanoy',ap:'Gamez Achicanoy',n1:'Luis',n2:'Fernando',nm:'Luis Fernando',g:'M',t:'3153610989',c:'luis.gamez@campusucc.edu.co',e:'OTRA',h:'DIUR',l:'10S'},
{i:'914989',d:'CC',n:'1013104953',a1:'Tavera',a2:'Vera',ap:'Tavera Vera',n1:'Sara',n2:'Manuela',nm:'Sara Manuela',g:'F',t:'3152431490',c:'sara.tavera@campusucc.edu.co',e:'COMPESAR EPS',h:'MNOC',l:'7S'},
{i:'852918',d:'CC',n:'1023370985',a1:'Cantor',a2:'Quiceno',ap:'Cantor Quiceno',n1:'Juan',n2:'Felipe',nm:'Juan Felipe',g:'M',t:'3502520371',c:'juan.cantorq@campusucc.edu.co',e:'SANITAS EPS',h:'DIUR',l:'8S'},
{i:'820519',d:'CC',n:'1005344554',a1:'Caranton',a2:'Rodriguez',ap:'Caranton Rodriguez',n1:'Sandra',n2:'Yaquelin',nm:'Sandra Yaquelin',g:'F',t:'3144519687',c:'sandra.caranton@campusucc.edu.co',e:'SALUD TOTAL',h:'MNOC',l:'10S'},
{i:'913114',d:'CC',n:'1019985579',a1:'Velasco',a2:'Cortes',ap:'Velasco Cortes',n1:'Diana',n2:'Sofia',nm:'Diana Sofia',g:'F',t:'3224578198',c:'diana.velascoc@campusucc.edu.co',e:'ALIANSALUD',h:'MNOC',l:'6S'},
{i:'751463',d:'CC',n:'1007101097',a1:'Rojas',a2:'Villarreal',ap:'Rojas Villarreal',n1:'Danna',n2:'Sofia',nm:'Danna Sofia',g:'F',t:'3017646388',c:'danna.rojas@campusucc.edu.co',e:'SANITAS EPS',h:'DIUR',l:'8S'},
];

async function main() {
  console.log(`Insertando ${E.length} estudiantes...`);
  let inserted = 0;
  for (const est of E) {
    const existing = await prisma.estudiante.findUnique({ where: { id_estudiante: est.i } });
    if (!existing) {
      await prisma.estudiante.create({
        data: {
          id_estudiante: est.i,
          tipo_documento: est.d,
          nro_documento: est.n,
          primer_apellido: est.a1,
          segundo_apellido: est.a2,
          apellidos: est.ap,
          primer_nombre: est.n1,
          segundo_nombre: est.n2,
          nombres: est.nm,
          genero: est.g === 'M' ? 'Masculino' : 'Femenino',
          telefono: est.t,
          correo: est.c,
          eps: est.e,
          ciclo_lectivo: '2610',
          codigo_sede: '01BOG',
          programa_academico: '01IIC',
          horario: est.h,
          nivel_academico: est.l,
          tipo_admision: 'REG',
          desc_tipo_admision: 'Regular',
        },
      });
      inserted++;
    }
  }
  console.log(`Seed completado: ${inserted} nuevos estudiantes insertados (total: ${E.length}).`);
  await prisma.$disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });
