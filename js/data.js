/* Trip data: edit places, times and notes here
   short = ชื่อสั้นที่ใช้เป็นป้ายบนแผนที่ย่อและปุ่มเลือกจุดหมาย */
const HOME={name:"บ้านฮัก (โฮมฮัก)",lat:17.8947324,lng:101.6605104,pid:"ChIJhxX1XKzHJjERMvF25QJXr1Q"};

const DAYS=[
 {n:1,label:"อังคาร 10 พ.ย.",sub:"ถึงบ่าย · วันพักตัว",stops:[
   {key:"home",info:true,time:"13:00",tag:"เช็กอิน",kind:"home",cat:"home",name:"ถึงบ้านฮัก เก็บของ",blurb:"ติดถนนคนเดิน ตรงข้าม 7-11 · มีจักรยานฟรี"},
   {key:"banchef",time:"14:00",tag:"ข้าวเที่ยง",kind:"plate",cat:"food",name:"Banchef Chiangkhan",short:"Banchef",blurb:"ร้านโฮมมี่ อาหารตามสั่งอร่อย จานละ 50–60 บาท",lat:17.8935838,lng:101.655265,pid:"ChIJcVRo_JfHJjERWQ9uEEwQOw0"},
   {key:"withaview",time:"15:30",tag:"คาเฟ่",kind:"view",cat:"cafe",name:"With A View Cafe’",short:"With A View",blurb:"นั่งยาวๆ ริมโขง รอพระอาทิตย์ตกราว 6 โมง",lat:17.8962355,lng:101.6568744,pid:"ChIJYSIiTADHJjERXMhBgdKsl3Q"},
   {key:"walk1",time:"17:30",tag:"เดินเล่น",kind:"lantern",cat:"walk",name:"ถนนคนเดินเชียงคาน",short:"ถนนคนเดิน",blurb:"ชิมของกินเล่น ของฝาก เดินเรื่อยๆ ไม่รีบ",lat:17.8959457,lng:101.6559866,pid:"ChIJO8G4Pl3HJjERnuZj46TUJqE"},
   {key:"bon",time:"19:00",tag:"มื้อค่ำริมโขง",kind:"beer",cat:"food",name:"Bon Appetit",short:"Bon Appetit",blurb:"นั่งริมน้ำ เบียร์เย็นๆ มีโต๊ะพูล บรรยากาศดี",lat:17.8930836,lng:101.6495786,pid:"ChIJaXi90AnHJjERpu5NOZifIjQ"}
 ]},
 {n:2,label:"พุธ 11 พ.ย.",sub:"เช้าชิล · เย็นหมูกระทะ",stops:[
   {key:"alms",info:true,time:"06:30",tag:"กิจกรรมเช้า",kind:"bowl",cat:"home",name:"ตักบาตรข้าวเหนียว",blurb:"หน้าที่พักมีชุดให้ · บรรยากาศเช้าเชียงคาน"},
   {key:"soisao",time:"07:30",tag:"ข้าวเช้า",kind:"noodle",cat:"food",name:"ข้าวเปียกเส้น ซอยเซา",short:"ข้าวเปียกเส้น",blurb:"ของเช้าซิกเนเจอร์เมือง เส้นเหนียวนุ่ม",lat:17.8968768,lng:101.6599468,pid:"ChIJbd2-Xi3GJjERHn7MnNv8Mm0"},
   {key:"heon",time:"12:30",tag:"ข้าวเที่ยงริมโขง",kind:"fish",cat:"food",name:"Heon Luangprabang",short:"Heon",blurb:"อาหารหลวงพระบาง วิวแม่น้ำโขง",warn:"ปิดวันอังคาร (วันพุธเปิดปกติ)",lat:17.8958351,lng:101.6555037,pid:"ChIJ98K_kC3GJjER_HPn_xD3Gho"},
   {key:"lemoon",time:"15:00",tag:"คาเฟ่แมว",kind:"cat",cat:"cafe",name:"Le’ Moon Home Cafe’",short:"Le’ Moon",blurb:"กลางถนนคนเดิน มีแมว 2 ตัว เค้กเด็ด · ปิด 18:30",lat:17.8931017,lng:101.6595673,pid:"ChIJR4NBEnLHJjERNKU--PS-0mM"},
   {key:"walk2",time:"17:30",tag:"เดินเล่น",kind:"lantern",cat:"walk",name:"ถนนคนเดิน (รอบสอง)",short:"ถนนคนเดิน รอบ 2",blurb:"เดินย่อยเรียกน้ำย่อยก่อนไปกินหมูกระทะ",lat:17.8959457,lng:101.6559866,pid:"ChIJO8G4Pl3HJjERnuZj46TUJqE"},
   {key:"kongyoo",time:"19:30",tag:"มื้อค่ำ",kind:"grill",cat:"mookata",name:"หมูกระทะกงยู",short:"หมูกระทะกงยู",blurb:"ซอย 7 ข้างวัดศรีคุณเมือง เซ็ต 300 อิ่ม 2 คน",lat:17.8937681,lng:101.6528282,pid:"ChIJvQJmdi3GJjERwpqJg-YmIxc"}
 ]},
 {n:3,label:"พฤหัส 12 พ.ย.",sub:"เช้าสบาย · เดินทางกลับ",stops:[
   {key:"flowa",time:"09:00",tag:"กาแฟ + ของฝาก",kind:"flower",cat:"cafe",name:"Flowa’coffee",short:"Flowa’coffee",blurb:"คาเฟ่ในสวนน่ารัก กาแฟดี เค้กแครอทเด็ด",lat:17.8869813,lng:101.6514446,pid:"ChIJVyMhAjjHJjERUKGukaqwo0A"},
   {key:"out",info:true,time:"11:00",tag:"เช็กเอาท์",kind:"home",cat:"home",name:"เก็บของ ขึ้นรถทัวร์กลับ",blurb:"สามล้อพาไปขึ้นรถที่แยกได้ · ออกก่อนเที่ยงรถไม่ติด"}
 ]}
];
