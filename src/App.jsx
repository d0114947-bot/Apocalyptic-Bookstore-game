import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ArrowRight, ArrowUpRight, BookOpen, Droplets, Heart, Lamp, Moon, RotateCcw, Sparkles, Sprout, Sun, X, Telescope, ScrollText } from 'lucide-react';
import BuildingOverview, { ROOMS } from './BuildingOverview.jsx';

const SAVE_KEY='bookstore-shelter-save-v2';
const asset=file=>import.meta.env.BASE_URL+'assets/'+file;
const optimizedImagePath=image=>typeof image==='string'?image.replace(/\.png(?=($|[?#]))/i,'.webp'):image;
const clamp=n=>Math.max(0,Math.min(100,Math.round(n)));
function manuscriptGain(resources){const weakest=Math.min(resources.power,resources.water,resources.morale);return weakest>=100?10:weakest>=90?8:weakest>=80?5:weakest>=70?3:weakest>=60?1:0;}
function manuscriptRuleText(resources){const gain=manuscriptGain(resources);return gain?`三項核心資源最低 ${Math.min(resources.power,resources.water,resources.morale)}%，手稿今晚增加 ${gain}%。規則：100% +10%、90% +8%、80% +5%、70% +3%、60% +1%。`:'三項核心資源未達 60%，手稿今晚暫停。資源越穩定，完成速度越快。';}
const DIFFICULTIES={easy:{label:'童話與溫拿鐵',drain:1.1,trade:1,trouble:.08,lodger:.1,incident:.07,typhoon:.04,petGift:0},normal:{label:'求生手冊與黑美式',drain:1.22,trade:.88,trouble:.13,lodger:.24,incident:.18,typhoon:.07,petGift:0},hard:{label:'殘破史詩與無糖配方',drain:1.36,trade:.78,trouble:.2,lodger:.4,incident:.38,typhoon:.12,petGift:.35},nightmare:{label:'燃盡秩序',drain:1.52,trade:.68,trouble:.28,lodger:.6,incident:.62,typhoon:.18,petGift:.5}};
const bgmTracks=['Warm Afternoon Sun - usesuno.com.mp3','Warm Afternoon Sun - usesuno.com2.mp3','Dusty Afternoon - usesuno.com1.mp3','Dusty Afternoon - usesuno.com.mp3'];
const prologueSlides=[
 {image:'prologue/scene-01.webp',text:['夜深了，街道一盞盞暗下去，只有這間書店的窗裡還留著暖光。你熟悉這裡每一道木頭的聲音，也記得每本書被放回書架時，封面輕輕碰在一起的聲音。','「晚一點再讀吧，明天還有時間。」你曾這樣對自己說。那時你以為，明天不過是再開一次門、替客人找一本他想讀的書；平凡如此理所當然，直到世界再也沒有照原本的樣子醒來。','[[YOU]]望著這扇熟悉的門，努力把不安壓進心底。若還有人在外面等待，這裡或許就能成為他們暫時停靠的地方。','（窗裡的燈，成了黑暗街道上最後一點溫度。）']},
 {image:'prologue/scene-02.webp',text:['那天，你原本只是在整理新到的書。紙箱裡帶著淡淡的紙味，午後的光落在書頁邊緣，你把一本本書分類、擦拭，再放回熟悉的位置。','「這本應該放在靠窗那排。」你低聲說，像是在和老朋友確認位置。生活很忙，卻安穩得讓人忘了珍惜；你還想著晚些時候要泡杯咖啡，也想著明天或許會有老客人回來。','那時的你還不知道，這會是最後一個如此平靜的午後。【有些日常，只有失去之後才知道多珍貴。】']},
 {image:'prologue/scene-03.webp',fadeImage:'prologue/scene-04.webp',text:['街上先是傳來急促的警報，接著人群奔逃、電力中斷，感染者的影子從雨幕裡逼近。警笛被雨聲切碎，遠處有人呼喊，接著只剩下不規則的腳步聲和玻璃破裂的聲響。','「救命！有人在裡面嗎？」雨幕中傳來陌生人的呼喊。你站在窗邊，手裡還握著剛整理好的書；腦中一片空白，心跳卻快得像要撞開胸口。','想逃的念頭只停留了一瞬。街上有人跌倒了，而書店的燈還亮著。你抓起門邊的鑰匙，對著雨裡的人大喊：「快過來！不要停下來！」','（警報聲漸遠，雨聲卻像整座城市都在喘息。）']},
 {image:'prologue/scene-05.webp',fadeImage:'prologue/scene-06.webp',text:['你拉下鐵門，帶著幾位倖存者躲進書店。奇異的光沿著牆面亮起，老書店的結構變得堅固，成了街區裡少數能抵禦危險的避難所。','「這裡真的安全嗎？」有人壓低聲音問。你看見對方仍在發抖，也感覺自己的手心沒有停止顫動，卻回答：「我不知道能保護多久，但今晚我們先一起守住這裡。」','金色光紋沿著牆角與梁柱慢慢展開，外頭的撞擊聲逐漸遠去。你仍然害怕；但當身後的人終於能喘一口氣，你知道自己不能只顧著害怕。【這扇門保護了你們，也把新的責任交到你手上。】','（光沿著書架移動，像有人在黑暗裡點亮一條回家的路。）']},
 {image:'prologue/scene-07.webp',text:['書架上的知識也有了新的用途：電學書能協助修復發電設備，給排水手冊能維護水管，故事與音樂可以安定疲憊的人心。你開始用另一種眼光看待這些熟悉的書脊：它們可能是一盞燈、一杯乾淨水，也可能是某個人熬過漫長夜晚的理由。','「這些書，真的能幫上忙嗎？」有人輕聲問。你指尖停在書脊上，沒有立刻回答；也許答案要靠你們一起找出來。','每次用書或拿去交易，都會消耗館藏；留下一本書，也許就多保住一段重要的知識。每次伸手取下一本書，你都得想一想：眼前的急需，和留給明天的可能，哪一個更不能失去？【知識會變成工具，也會變成希望。】']},
 {image:'prologue/scene-08.webp',text:['白天，你會接待倖存者，決定交易、收留或伸出援手。每個走進門的人都有自己的故事，也可能帶來新的消息、物資，或一道更難回答的選擇。','夜晚，你可以安排修繕、播種、照顧動物，再讓大家休息。你得留意電力、乾淨水、舒適度與食物，讓有限的資源撐過下一天。不是每件事都能一次做好；有時能守住一盞燈，就已經替某個人留下了方向。','「只要還有人願意翻開一本書，明天就還有別的可能。」你望向仍亮著燈的書架，決定先把今天守好，再為明天留一頁空白。','（門外依然危險。門內的燈，仍然亮著。）']},
];
const plantedPotImages=['蔬菜種植盆.webp','小白菜種植盆.webp','胡蘿蔔種植盆.webp','草莓種植盆.webp'];
const startingBooks={'基礎電學':2,'流體力學':2,'給排水系統解析':1,'心理學':2,'犯罪心理學':1,'音樂 CD':2,'末世雜誌':2};
const makeStartingBooks=()=>Object.fromEntries(Object.keys(startingBooks).map(title=>[title,10+Math.floor(Math.random()*11)]));
const petLines={貓咪:['「喵——這裡有個暖和的角落。」','「呼嚕……你今天看起來有點累。」','「喵！我在書架旁找到一個新祕密。」','「摸摸頭的話，我可以陪你一下。」'],狗狗:['「汪！今天也一起守著書店吧！」','「我聞到食物的味道了，可以分我一點嗎？」','「外面有聲音，我會幫你留意。」','「尾巴搖搖——你回來我很高興。」']};
const people=[
 ['林沐','01','安靜細心'],['葉知夏','02','謹慎務實'],['沈青禾','03','經驗豐富'],['周予安','04','好奇勇敢'],['許書晴','05','精力充沛'],
 ['陳小川','06','喜歡閱讀'],['魏先生','07','沉著寡言'],['方以晨','08','健談爽朗'],['阿哲','09','觀察敏銳'],['夏明','10','溫和有禮'],
 ['許阿姨','11','心思細膩'],['林爺爺','12','閱讀愛好者'],['小滿','13','親切熱心'],['米米','14','樂於幫忙'],['江若','15','愛惜書本'],
 ['小岑','16','沉靜友善'],['陳奶奶','17','溫柔細心'],['以寧','18','謹慎慢熟'],['阿澤','19','樂觀溫柔'],['修理工阿岳','20','手巧可靠'],
 ['周女士','26','安靜細心'],['林奶奶','27','沉著慈祥'],['若晴','28','溫和親切'],
].map(([name,id,personality])=>({id:'resident-'+id,name,image:asset('cast/survivor-'+id+'.webp'),personality}));
const animals=[
 {id:'black-cat',name:'煤球',kind:'貓咪',image:asset('cast/cat-dog-1.webp')},
 {id:'play-cat',name:'花花',kind:'貓咪',image:asset('cast/cat-dog-2.webp')},
 {id:'book-cat',name:'橘子',kind:'貓咪',image:asset('cast/cat-dog-3.webp')},
 {id:'corgi',name:'小麥',kind:'狗狗',image:asset('cast/cat-dog-4.webp')},
 {id:'hat-dog',name:'阿福',kind:'狗狗',image:asset('cast/cat-dog-5.webp')},
];
const seasons=['春季','夏季','秋季','冬季'], skies=['晴天','雨天','大雨天','陰天','多雲天','霧天','雷雨天'];
const random=a=>a[Math.floor(Math.random()*a.length)];
function makeWeather(season,day,difficulty='easy'){const sky=Math.random()<(DIFFICULTIES[difficulty]?.typhoon??.04)?'颱風':random(skies);return {season:season||random(seasons),sky,day};}
const stories=['我一路沿著河堤走來，想知道還有沒有人守著這一帶。','我把家人安頓在附近，出門前答應一定帶點消息回去。','以前我常來這間書店，沒想到災後還能看見燈亮著。','外面好幾條街都淹了，我繞了很久才找到這裡。','我在路上遇見幾個鄰居，大家都在等救援隊的消息。','停電後我一直靠記憶找路，今天總算找到一個能歇腳的地方。'];
const voices=['說話很輕，句尾總留著一點遲疑。','語速很快，像是怕忘記重要的事。','習慣先觀察四周，再慢慢說出想法。','講話爽朗，偶爾用笑聲掩住疲倦。','停頓很多，提到家人時會放柔聲音。'];
const newGame=(nickname='',season=random(seasons),gender='female',difficulty='easy')=>({nickname,gender,difficulty,day:1,phase:'day',season,weather:makeWeather(season,1,difficulty),resources:{power:100,water:100,morale:100},books:makeStartingBooks(),equipment:[],supplies:{cleanWater:10,seeds:0,vegetables:3,food:5,fruits:3},crops:[],manuscript:0,incoming:[],lodgers:[],pets:[],visitorBoost:0,relationships:{},rescuedCount:0,petFedDay:0,petPlayedDay:0,onboardingStage:'prologue',prologueIndex:0,tutorialStep:0,log:['第 1 天開始。倉儲有糧食 5、乾淨水 10、種子 0、蔬菜 3、水果 3。']});
const tradeOffers=[
 {book:'末世雜誌',item:'密封糧食',loot:{food:3+Math.floor(Math.random()*6)},line:'我找到幾包還沒受潮的糧食，想看看能不能換本書。'},
 {book:'給排水系統解析',item:'管線零件與乾淨水',resource:'water',gain:16+Math.floor(Math.random()*16),loot:{cleanWater:3+Math.floor(Math.random()*7),food:1+Math.floor(Math.random()*3)},line:'我找到一些還能用的管線零件與乾淨水，想換一本給排水方面的書。'},
 {book:'基礎電學',item:'發電機零件與糧食',resource:'power',gain:20+Math.floor(Math.random()*15),loot:{food:1+Math.floor(Math.random()*4)},line:'我拆到一點能用的零件，還有些乾糧，想交換一本實用的書。'},
 {book:'流體力學',item:'濾水芯、水果與糧食',resource:'water',gain:20+Math.floor(Math.random()*15),loot:{cleanWater:3+Math.floor(Math.random()*7),fruits:1+Math.floor(Math.random()*4),food:2+Math.floor(Math.random()*3)},line:'我帶了濾水芯、水果和乾糧，能不能換一本談水的書？'},
 {book:'音樂 CD',item:'蔬菜、糧食與種子',resource:'morale',gain:18+Math.floor(Math.random()*12),loot:{vegetables:1+Math.floor(Math.random()*4),food:2+Math.floor(Math.random()*3),seeds:1+Math.floor(Math.random()*3)},line:'很久沒聽音樂了。我有一些蔬菜、乾糧和種子，想用來換一張 CD。'},
];
function rollNightIncident(resources,supplies,difficulty){
 const rate=DIFFICULTIES[difficulty]||DIFFICULTIES.easy;if(Math.random()>=rate.incident)return null;
 const kind=random(['power','water','morale','theft','gift']);
 if(['power','water','morale'].includes(kind)){const amount=6+Math.floor(Math.random()*19);resources[kind]=clamp(resources[kind]-amount);const labels={power:'發電與照明',water:'給水與管線',morale:'空間舒適度'},stories={power:['老舊電線在夜裡啪地一聲，幾盞燈暗了下來。','發電機皮帶鬆脫，機房傳來一陣刺耳的摩擦聲。'],water:['牆內傳來漏水聲，一段管線接頭鬆了。','水槽的濾芯堵住，幫浦運轉得斷斷續續。'],morale:['夜裡的爭吵聲讓每個人都睡得不安穩。','寒風從破窗鑽進來，屋裡的人都難以放鬆。']};return {title:'夜間意外',text:`${random(stories[kind])}${labels[kind]}下降 ${amount}%。`};}
 const keys=['food','vegetables','fruits','seeds'],names={food:'糧食',vegetables:'蔬菜',fruits:'水果',seeds:'種子'},available=keys.filter(key=>kind==='gift'||supplies[key]>0).sort(()=>Math.random()-.5).slice(0,1+Math.floor(Math.random()*3));
 if(kind==='theft'&&!available.length)return {title:'夜間意外',text:'浣熊在倉儲翻找了半天，幸好沒有偷走任何物資。'};
 const changes=available.map(key=>{const amount=1+Math.floor(Math.random()*4);if(kind==='theft'){const lost=Math.min(amount,supplies[key]);supplies[key]-=lost;return `${names[key]} ${lost}${key==='seeds'?' 包':' 份'}`;}supplies[key]+=amount;return `${names[key]} ${amount}${key==='seeds'?' 包':' 份'}`;});
 return kind==='theft'?{title:'浣熊闖入倉儲',text:`夜裡有浣熊鑽進倉儲，叼走了${changes.join('、')}。`}:{title:'貓狗帶回補給',text:`貓狗清晨從街角叼回了${changes.join('、')}，像是替書店找到一點希望。`};
}
function createLodgerEvent(lodgers,difficulty){const rates=DIFFICULTIES[difficulty]||DIFFICULTIES.easy;if(!lodgers.length||Math.random()>=rates.lodger)return null;const guest=random(lodgers),event=random([
 {title:'浴室的水聲久久未停',story:`深夜裡，${guest.name}洗了很久。水箱的水位明顯下降，隔著門還聽得見他疲倦的嘆息。`,choices:[{label:'敲門提醒節水',reply:`${guest.name}趕緊關小水流，抱歉地說只是太久沒能安心洗澡。`,water:[5,12],trust:1,days:1},{label:'替他準備熱水',reply:`${guest.name}感激地接過熱水，答應明晚幫忙修好鬆動的水龍頭。`,water:[12,22],trust:2,days:1},{label:'要求他今晚離開',reply:`${guest.name}沉默地收拾行李，離開前把門輕輕帶上。`,leave:true,trust:-2}]},
 {title:'半夜的腳步聲',story:`凌晨時分，${guest.name}在閱覽室來回踱步，翻動書頁的聲音讓其他人也醒了。`,choices:[{label:'坐下來聽他說說話',reply:`${guest.name}說起一路上的惡夢，聊過後終於安靜下來。`,morale:3,trust:2,days:1},{label:'請他到安靜角落閱讀',reply:`${guest.name}點頭搬到窗邊，保證不再打擾大家。`,morale:1,trust:1,days:0},{label:'告訴他必須離開',reply:`${guest.name}感到受傷，連夜離開了書店。`,leave:true,trust:-2}]},
 {title:'潮濕的行李',story:`一場漏水打濕了${guest.name}的毯子和幾本隨身書。對方正猶豫要不要繼續留在這裡。`,choices:[{label:'拿乾毯和書替他安置',reply:`${guest.name}把乾毯抱在懷裡，決定再多住幾天幫忙整理書架。`,morale:2,trust:2,days:2},{label:'請他一起搬開漏水區的書',reply:`${guest.name}捲起袖子，和你一起把受潮的書搬到高處。`,water:0,trust:1,days:1},{label:'讓他自行決定去留',reply:`${guest.name}道謝後帶著行李離開，說不想再增加大家的負擔。`,leave:true,trust:0}]}
]);return {...event,guestId:guest.id,guestName:guest.name,characterId:guest.characterId||guest.id};}
function makeDay(day,season,visitBoost=0,relationships={},difficulty='easy'){
 const count=1+Math.floor(Math.random()*4), arrivals=[];
 const chance=Math.min(.99,.91+(season==='冬季'?.06:0)+(season==='夏季'?.04:0)+Math.min(.08,visitBoost*.02));
 const profiles=Math.random()<chance?[...people].sort(()=>Math.random()-.5).slice(0,count):[];
 const returning=Object.entries(relationships).filter(([,r])=>r?.person&&Math.random()<(r.trust>0?Math.min(.62,.12+r.trust*.09):r.trust<0?.06:.12)).map(([,r])=>r.person);
 if(returning.length&&profiles.length){const visitor=random(returning);profiles[0]=visitor;if(profiles.length<4&&Math.random()<.38)profiles.push({...visitor,id:(visitor.characterId||visitor.id)+'-family',characterId:(visitor.characterId||visitor.id)+'-family',name:visitor.name+'的家人',familyMember:true});}
  profiles.forEach(person=>{
  const roll=Math.random();
   const story=person.familyMember?random(['我和家人一起走了很遠，終於找到她說過的書店。','之前聽家人提起你們，今天想親自來看看。']):random(stories),voice=random(voices),bubble=person.familyMember?'我是跟著家人一起來的，路上還聽到一些街區的新消息。':random(['今天路上很安靜，讓人有點不習慣。','我剛從附近街區繞過來，外面變了好多。','你們這裡還亮著燈，真讓人安心。','我今天走了好幾條街，終於找到有人煙的地方。','外面一直下雨，大家都在找能歇腳的地方。']);
   const characterId=person.characterId||person.id;
   const relation=Object.values(relationships).find(r=>r?.person?.characterId===characterId);
   const reunion=Boolean(relation);
   const rates=DIFFICULTIES[difficulty]||DIFFICULTIES.easy,troubleBoundary=.15+rates.trouble;
   if(roll<.15){const days=2+Math.floor(Math.random()*5);arrivals.push({...person,characterId,id:day+'-'+characterId+'-'+Math.random(),kind:'stay',days,story,voice,bubble:(reunion?'「我回來了，還記得上次你們的幫忙。」 ':'')+bubble+' 我想找個地方留宿。',line:random(['外頭很不安全，我能在閱覽室借住幾晚嗎？','我不想拖累別人，只需要一個今晚能躲雨的地方。','可以讓我安靜待幾天嗎？我會幫忙整理書。']),reunion});}
   else if(roll<troubleBoundary) arrivals.push({...person,characterId,id:day+'-'+characterId+'-'+Math.random(),kind:'trouble',story,voice,bubble:(reunion?'「我又來了，但上次的事我還記得。」 ':'')+bubble+' 我真的需要一些幫助！',line:random(['我已經走投無路了，給我點東西！','別逼我動手，我只是想活下去！','把門打開！你們不能把所有東西都留給自己！']),reunion});
   else {const offer=random(tradeOffers),mult=rates.trade;arrivals.push({...offer,gain:offer.gain?Math.max(1,Math.round(offer.gain*mult)):undefined,characterId,id:day+'-'+characterId+'-'+Math.random(),kind:'trade',story,voice,bubble:(reunion?'「上次那本書幫了我不少忙，這次帶了些東西回來。」 ':'')+bubble+' 我帶了物資，想談談交易。',line:random([offer.line,`我從外面帶回一些補給。${offer.line}`,`路上遇到不少麻煩，不過還是找到東西了。${offer.line}`]),loot:Object.fromEntries(Object.entries(offer.loot).map(([k,v])=>[k,Math.max(1,Math.round((v+Math.floor(Math.random()*3)-1)*mult))])),reunion});}
 });
 const colder=season==='冬季',hotter=season==='夏季';
 const petChance=Math.min(.95,.23+(colder?.42:0)+(hotter?.3:0)),petCount=Math.random()<petChance?1+Math.floor(Math.random()*3):0,rates=DIFFICULTIES[difficulty]||DIFFICULTIES.easy;
 const pets=[...animals].sort(()=>Math.random()-.5).slice(0,petCount).map(p=>{const gift=rates.petGift>0&&Math.random()<rates.petGift?random(['food','vegetables','fruits','seeds']):null;return {...p,id:day+'-'+p.id,roomId:random(ROOMS).id,x:6+Math.floor(Math.random()*37),gift,giftAmount:gift?1+Math.floor(Math.random()*3):0};});
 return {incoming:arrivals,pets};
}
function loadSave(){
 try{
  const saved=JSON.parse(localStorage.getItem(SAVE_KEY));
  if(!saved?.nickname||!saved?.resources||!saved?.books)return newGame();
  const base=newGame(saved.nickname,saved.season,saved.gender||'female');
  const books={...saved.books};if(books['農業圖鑑']&&!books['給排水系統解析'])books['給排水系統解析']=books['農業圖鑑'];delete books['農業圖鑑'];
  const personFor=person=>{const key=(person.characterId||person.id||'').replace(/-family$/,''),image=optimizedImagePath(person.image),assetId=image?.match(/survivor-(\d+)\.(?:webp|png)/i)?.[1],fallback=people.find(p=>p.id===key||key.includes(p.id))||people.find(p=>p.id==='resident-'+assetId);return {...fallback,...person,name:person.name||fallback?.name||'倖存者',personality:person.personality||fallback?.personality||'謹慎觀察',image:image||fallback?.image};};
   return {...base,...saved,onboardingStage:saved.onboardingStage||'complete',prologueIndex:saved.prologueIndex||0,tutorialStep:saved.tutorialStep||0,difficulty:saved.difficulty||'easy',books,phase:saved.phase||'day',weather:saved.weather||base.weather,supplies:{...base.supplies,...saved.supplies},incoming:(saved.incoming||[]).map(v=>({...personFor(v),...(v.book==='農業圖鑑'?{book:'給排水系統解析'}:{})})),lodgers:(saved.lodgers||[]).map(personFor),crops:saved.crops||[],pets:Array.isArray(saved.pets)?saved.pets.filter(p=>p.roomId).map(p=>({...p,name:p.name||animals.find(a=>p.id?.endsWith(a.id))?.name||'陪伴動物',image:optimizedImagePath(p.image)||animals.find(a=>p.id?.endsWith(a.id))?.image||asset('cast/cat-dog-1.webp')})):[],visitorBoost:saved.visitorBoost||0,relationships:Object.fromEntries(Object.entries(saved.relationships||{}).map(([key,value])=>[key,{...value,person:value.person?personFor(value.person):value.person}])),rescuedCount:saved.rescuedCount||0,petFedDay:saved.petFedDay??(saved.petCareDay??0),petPlayedDay:saved.petPlayedDay??(saved.petCareDay??0)};
 }catch{return newGame();}
}
const foodNames={food:'糧食',vegetables:'蔬菜',fruits:'水果'};
const resourceHelp={power:'每日耗損會受天氣影響。使用《基礎電學》提高穩定度，交易也可能取得發電機零件。',water:'每日耗損會受天氣影響。使用《給排水系統解析》維護；雨天會補充乾淨水。',comfort:'由供電、給水、食物與書店狀態影響。使用《心理學》或音樂 CD 可提升。',food:'糧食可從倖存者交易取得。每天會隨機吃掉二至三份糧食、蔬菜或水果。',vegetables:'可透過倖存者交易或屋頂種植取得，成熟後自動採收。',fruits:'可透過倖存者交易或屋頂種植取得，成熟後自動採收。',seeds:'主要由倖存者交易取得；夜晚可在屋頂播種。',cleanWater:'雨天過濾增加乾淨水。使用《流體力學》可增加 22 份乾淨水。每晚飲用與澆灌會消耗，屋頂作物越多用水越多。',crops:'夜晚用種子播種；作物需要乾淨水澆灌，幾天後自動採收入庫。'};
function unfinishedTasks(game){const tasks=[];if(game.resources.power<80)tasks.push('檢查發電與照明');if(game.resources.water<80)tasks.push('維護給水與管線');if(game.resources.morale<80)tasks.push('恢復空間舒適度');if(game.supplies.cleanWater<4)tasks.push('留意乾淨水存量');if(game.supplies.food+game.supplies.vegetables+game.supplies.fruits<3)tasks.push('補充食物');if(game.incoming.length)tasks.push(`回應 ${game.incoming.length} 位來客`);if(game.phase==='night'&&!game.crops.length&&game.supplies.seeds>0)tasks.push('到屋頂播下種子');return tasks;}
function gRoofReport(game){const r=game.dayReport;if(!r)return '今天還沒有新的露臺紀錄。';return `乾淨水：${r.beforeSupplies.cleanWater} → ${r.afterSupplies.cleanWater} 份。\n種植盆：${r.beforeCrops} → ${r.afterCrops} 盆。${r.rain?`\n雨水過濾增加 ${r.rain} 份。`:''}${r.harvests.length?`\n自動採收：${r.harvests.join('、')}。`:''}`;}
function gStorageReport(game){const r=game.dayReport;if(!r)return '今天還沒有新的倉儲紀錄。';const books=r.bookChanges?.length?'\n館藏變化：'+r.bookChanges.map(b=>`《${b.title}》 ${b.before} → ${b.after} 本`).join('、'):'\n館藏數量沒有變化。';return `糧食：${r.beforeSupplies.food} → ${r.afterSupplies.food} 份。\n蔬菜：${r.beforeSupplies.vegetables} → ${r.afterSupplies.vegetables} 份。\n水果：${r.beforeSupplies.fruits} → ${r.afterSupplies.fruits} 份。\n種子：${r.beforeSupplies.seeds} → ${r.afterSupplies.seeds} 包。\n乾淨水：${r.beforeSupplies.cleanWater} → ${r.afterSupplies.cleanWater} 份。${books}`;}

export default function App(){
 const [game,setGame]=useState(loadSave),[nickname,setNickname]=useState(()=>loadSave().nickname||''),[gender,setGender]=useState(()=>loadSave().gender||'female'),[room,setRoom]=useState(null),[showLogin,setShowLogin]=useState(true);
 const [difficulty,setDifficulty]=useState(()=>loadSave().difficulty||'easy'),[musicMuted,setMusicMuted]=useState(false),[musicTrack,setMusicTrack]=useState(()=>random(bgmTracks));
 const [returningHome,setReturningHome]=useState(false),[journalOpen,setJournalOpen]=useState(false),[selectedVisitorId,setSelectedVisitorId]=useState(null),[selectedBook,setSelectedBook]=useState(null);
 const bgmRef=useRef(null),ambienceRef=useRef(null);
 const [pendingBook,setPendingBook]=useState(null),[petDialog,setPetDialog]=useState(null),[toast,setToast]=useState(null),[progressOpen,setProgressOpen]=useState(false),[alert,setAlert]=useState(null),[sleepConfirm,setSleepConfirm]=useState(false),[sleepPreview,setSleepPreview]=useState(null),[telescope,setTelescope]=useState(null),[explainer,setExplainer]=useState(null),[roomReport,setRoomReport]=useState(null),[stormPrep,setStormPrep]=useState(false),[stormPicks,setStormPicks]=useState([]),[dawnScene,setDawnScene]=useState(null),[survivorScene,setSurvivorScene]=useState(null),[windowView,setWindowView]=useState(null),[lodgerEvent,setLodgerEvent]=useState(null),[radioMessage,setRadioMessage]=useState(null);
  const [openingIntro,setOpeningIntro]=useState(false),[prologueIndex,setPrologueIndex]=useState(0),[prologueClosing,setPrologueClosing]=useState(false),[gameReveal,setGameReveal]=useState(false),[tutorialActive,setTutorialActive]=useState(false),[tutorialStep,setTutorialStep]=useState(0),[tutorialSpot,setTutorialSpot]=useState(null),[assetLoading,setAssetLoading]=useState(false),[assetLoadProgress,setAssetLoadProgress]=useState(0);
 useEffect(()=>{if(game.nickname)try{localStorage.setItem(SAVE_KEY,JSON.stringify(game));}catch(e){console.error('自動保存失敗',e);}},[game]);
 useEffect(()=>{
   const endingMusic=game.ending&&!showLogin,prologueMusic=openingIntro;
   const source=endingMusic?asset('Morning Light at the Cafe - usesuno.com.mp3'):prologueMusic?asset('Warm Afternoon Sun - usesuno.com.mp3'):asset(musicTrack);
  let audio=bgmRef.current;
  if(!audio||audio.dataset.source!==source){
    const next=new Audio(source);next.loop=endingMusic||prologueMusic;next.volume=prologueMusic?.32:0;next.dataset.source=source;next.onended=()=>{if(!endingMusic&&!prologueMusic&&!musicMuted)setMusicTrack(current=>random(bgmTracks.filter(track=>track!==current)));};bgmRef.current=next;
   if(!musicMuted)next.play().then(()=>{if(!prologueMusic){let v=0;const fade=setInterval(()=>{v=Math.min(.32,v+.025);next.volume=v;if(v>=.32)clearInterval(fade);},90);}}).catch(()=>{});
   if(audio){const old=audio;let v=old.volume;const fade=setInterval(()=>{v=Math.max(0,v-.04);old.volume=v;if(!v){clearInterval(fade);old.pause();}},60);}
   audio=next;
  }else{audio.loop=endingMusic||prologueMusic;if(musicMuted){audio.pause();audio.volume=0;}else if(audio.paused){audio.volume=prologueMusic?.32:audio.volume;audio.play().then(()=>{if(!prologueMusic)audio.volume=.32;}).catch(()=>{});}}
  return ()=>{};
  },[game.ending,showLogin,musicTrack,musicMuted,openingIntro,prologueIndex]);
 useEffect(()=>{
  const sky=game.weather?.sky,weatherAudio=({'雨天':'小雨音效.mp3','大雨天':'大雨音效.mp3','雷雨天':'雷雨音效.mp3','颱風':'颱風音效.mp3'})[sky];
   const prologueAudio=openingIntro?(prologueIndex===2?asset('小雨音效.mp3'):prologueIndex===3?asset('地下機房運轉音效.mp3'):null):null;
   const source=game.ending||tutorialActive?null:prologueAudio||(!openingIntro?(room?.id==='machine'?asset('地下機房運轉音效.mp3'):weatherAudio&&(!room||room.id==='roof')?asset(weatherAudio):room?.id==='roof'?asset(`${game.phase==='night'?'夜晚':'白天'}屋頂露臺音效.mp3`):null):null);
  const previous=ambienceRef.current;
  if(previous?.dataset.source===source)return;
  if(previous){const old=previous;let v=old.volume;const fade=setInterval(()=>{v=Math.max(0,v-.06);old.volume=v;if(!v){clearInterval(fade);old.pause();}},55);ambienceRef.current=null;}
  if(source){const next=new Audio(source);next.loop=true;next.volume=0;next.dataset.source=source;ambienceRef.current=next;next.play().then(()=>{let v=0;const fade=setInterval(()=>{v=Math.min(.22,v+.018);next.volume=v;if(v>=.22)clearInterval(fade);},80);}).catch(()=>{});}
  },[room?.id,game.phase,game.weather?.sky,game.ending,openingIntro,prologueIndex,tutorialActive]);
 function preloadGameImages(nextGame){
  setAssetLoading(true);setAssetLoadProgress(0);
   const files=[nextGame.phase==='night'?'書店全景導覽-晚上.webp':'bookstore-overview.webp',...ROOMS.map(room=>room.image),...['屋頂露臺-晚上.webp','二樓閱覽室-晚上.webp','一樓咖啡書店-晚上.webp',...prologueSlides.flatMap(slide=>[slide.image,slide.fadeImage].filter(Boolean))],...nextGame.incoming.map(person=>person.image),...nextGame.pets.map(pet=>pet.image),'cast/shopkeeper-'+nextGame.gender+'.webp'].filter(file=>typeof file==='string'&&file.length>0).map(file=>file.startsWith('/')||file.startsWith('http')?file:asset(file));
  const sources=[...new Set(files)],total=sources.length;let loaded=0,finished=false;
  const complete=()=>{if(finished)return;finished=true;setAssetLoadProgress(100);setAssetLoading(false);};
  const tasks=sources.map(src=>new Promise(resolve=>{const img=new Image();let settled=false;const done=()=>{if(settled)return;settled=true;loaded++;setAssetLoadProgress(Math.round(loaded/total*100));resolve();};img.onload=done;img.onerror=done;img.src=src;if(img.complete)done();}));
  const timeout=setTimeout(complete,8000);Promise.all(tasks).then(()=>{clearTimeout(timeout);complete();});
 }
 function note(line){setGame(prev=>({...prev,log:[line,...prev.log].slice(0,40)}));}
 function startNewGame(e){
  e.preventDefault();const name=nickname.trim();if(!name)return;bgmRef.current?.play().catch(()=>{});
  const season=random(seasons),base=newGame(name,season,gender,difficulty),arrivals=makeDay(1,season,0,{},difficulty),supplies={...base.supplies},petGifts=[];
  arrivals.pets.forEach(p=>{if(p.gift){supplies[p.gift]=(supplies[p.gift]||0)+p.giftAmount;petGifts.push(`${p.name}叼來${({food:'糧食',vegetables:'蔬菜',fruits:'水果',seeds:'種子'})[p.gift]} ${p.giftAmount}${p.gift==='seeds'?' 包':' 份'}。`);}});
   const nextGame={...base,...arrivals,supplies,pets:arrivals.pets.map(p=>({...p,hungry:Math.random()<.42})),onboardingStage:'prologue',prologueIndex:0,tutorialStep:0,log:['第 1 天白天開始。天氣：'+base.weather.sky+'。',...base.log]};
   setGame(nextGame);preloadGameImages(nextGame);setPrologueIndex(0);setTutorialStep(0);setTutorialActive(false);setOpeningIntro(true);
  setShowLogin(false);
 }
  function continueGame(){bgmRef.current?.play().catch(()=>{});setNickname(game.nickname||'');setGender(game.gender||'female');setDifficulty(game.difficulty||'easy');preloadGameImages(game);setShowLogin(false);if(game.onboardingStage==='prologue'){setPrologueIndex(game.prologueIndex||0);setOpeningIntro(true);}else if(game.onboardingStage==='tutorial'){setTutorialStep(game.tutorialStep||0);setTutorialActive(true);}else{setOpeningIntro(false);setTutorialActive(false);}}
  function persistOnboarding(stage,step=game.tutorialStep,index=prologueIndex){setGame(current=>({...current,onboardingStage:stage,tutorialStep:step,prologueIndex:index}));}
  function beginTutorial(){setOpeningIntro(false);setRoom(null);setTutorialStep(0);setTutorialActive(true);persistOnboarding('tutorial',0,prologueIndex);}
  function playDoorOpenSound(){try{const AudioContextClass=window.AudioContext||window.webkitAudioContext;if(!AudioContextClass)return;const context=new AudioContextClass(),osc=context.createOscillator(),tone=context.createGain(),buffer=context.createBuffer(1,context.sampleRate*.8,context.sampleRate),data=buffer.getChannelData(0);for(let i=0;i<data.length;i++)data[i]=(Math.random()*2-1)*(1-i/data.length);const noise=context.createBufferSource(),filter=context.createBiquadFilter(),noiseGain=context.createGain();osc.type='triangle';osc.frequency.setValueAtTime(155,context.currentTime);osc.frequency.exponentialRampToValueAtTime(58,context.currentTime+.7);tone.gain.setValueAtTime(.0001,context.currentTime);tone.gain.exponentialRampToValueAtTime(.055,context.currentTime+.08);tone.gain.exponentialRampToValueAtTime(.0001,context.currentTime+.85);osc.connect(tone).connect(context.destination);osc.start();osc.stop(context.currentTime+.9);noise.buffer=buffer;filter.type='lowpass';filter.frequency.value=520;noiseGain.gain.setValueAtTime(.0001,context.currentTime);noiseGain.gain.exponentialRampToValueAtTime(.045,context.currentTime+.12);noiseGain.gain.exponentialRampToValueAtTime(.0001,context.currentTime+.8);noise.connect(filter).connect(noiseGain).connect(context.destination);noise.start();noise.stop(context.currentTime+.82);setTimeout(()=>context.close().catch(()=>{}),1200);}catch{}}
  function finishPrologue(){if(prologueClosing)return;setPrologueClosing(true);setTimeout(playDoorOpenSound,460);setTimeout(()=>{beginTutorial();setGameReveal(true);setTimeout(()=>{setPrologueClosing(false);setGameReveal(false);},1150);},820);}
  function advancePrologue(){if(prologueIndex>=prologueSlides.length-1){finishPrologue();return;}const next=prologueIndex+1;if(next===4){const pageTurn=new Audio(asset('翻書音效.mp3'));pageTurn.volume=.35;pageTurn.play().catch(()=>{});}setPrologueIndex(next);persistOnboarding('prologue',game.tutorialStep,next);}
  function skipPrologue(){beginTutorial();}
  const tutorialTarget=tutorialStep===0?(!room?'storage-entry':null):tutorialStep===1?'book-select':tutorialStep===2?(!room?'machine-entry':'power-check'):tutorialStep===3?'water-check':tutorialStep===4?(!room?'cycle-check':'overview-back'):null;
  const tutorialCopy=[
   {title:'查看書店物資',text:'在末世中，每一份物資都很重要。先確認書店目前擁有多少生存資源。'},
   {title:'認識館藏書籍',text:'這些書籍不只是收藏品，更是維持避難所運作的重要知識資源。使用或交易都會消耗館藏。'},
   {title:'檢查電力',text:'電力是維持書店運作的重要條件，記得隨時留意供電狀態。'},
   {title:'檢查乾淨水',text:'乾淨的水是每天都不可缺少的資源，必須維持穩定供應。'},
   {title:'認識夜間經營',text:room?'先回到全景，再查看白天與夜晚的狀態；這裡只認識節奏，不會推進時間或消耗物資。':'白天與夜晚有不同的經營節奏。妥善安排每一天，才能讓書店持續運作。'},
  ];
  function handleTutorialClick(event){if(!tutorialActive)return;const clicked=event.target instanceof Element?event.target.closest('[data-tutorial-target]'):null,target=clicked?.dataset.tutorialTarget;const allowed=target===tutorialTarget||(tutorialStep===4&&room&&target==='overview-back');if(!allowed){event.preventDefault();event.stopPropagation();return;}if(target==='overview-back'||(tutorialStep===2&&target==='machine-entry'))return;const next=tutorialStep+1;setTutorialStep(next);setGame(current=>({...current,onboardingStage:'tutorial',tutorialStep:next}));if(tutorialStep===1)setRoom(null);}
  function finishTutorial(){setTutorialActive(false);setRoom(null);setGame(current=>({...current,onboardingStage:'complete',prologueIndex:prologueSlides.length-1,tutorialStep:5}));}
  useEffect(()=>{if(!tutorialActive||tutorialStep>=5||!tutorialTarget)return;let frame=0;const update=()=>{const target=document.querySelector(`[data-tutorial-target="${tutorialTarget}"]`);if(!target){setTutorialSpot(null);return;}const rect=target.getBoundingClientRect();setTutorialSpot({x:rect.left+rect.width/2,y:rect.top+rect.height/2,w:rect.width,h:rect.height});};frame=requestAnimationFrame(update);window.addEventListener('resize',update);return()=>{cancelAnimationFrame(frame);window.removeEventListener('resize',update);};},[tutorialActive,tutorialStep,tutorialTarget,room]);
 function toggleMusic(){const next=!musicMuted;setMusicMuted(next);const audio=bgmRef.current;if(audio){if(next)audio.pause();else audio.play().catch(()=>{});}}
 function playRandomVisitorSfx(){const files=['翻書音效.mp3',...Array.from({length:7},(_,i)=>`放下音效${i+1}.mp3`)];const audio=new Audio(asset(random(files)));audio.volume=.48;audio.play().catch(()=>{});}
 function enterRoom(next){setRoom(next);setSelectedBook(null);setSelectedVisitorId(null);const petsInRoom=game.pets.filter(p=>p.roomId===next?.id);setPetDialog(petsInRoom.length?{id:petsInRoom[0].id,text:random(petLines[petsInRoom[0].kind]||petLines['貓咪'])}:null);if(next?.id==='manager'&&game.petFedDay!==game.day&&game.pets.some(p=>p.hungry))setAlert({title:'牠們好像餓了',text:'貓狗在書店裡蹭著你的手。今晚要不要分一份糧食給牠們？也可以先陪牠們玩一會兒。'});if(next?.id==='roof'&&game.day>1&&game.seenRoofDay!==game.day){setGame(g=>({...g,seenRoofDay:g.day}));setRoomReport({title:'屋頂露臺・今日變化',text:gRoofReport(game)});}if(next?.id==='storage'&&game.day>1&&game.seenStorageDay!==game.day){setGame(g=>({...g,seenStorageDay:g.day}));setRoomReport({title:'倉儲清單・今日變化',text:gStorageReport(game)});}}
 function deferVisitor(){setSelectedVisitorId(null);}
 function leaveTelescope(){setTelescope(null);setGame(g=>({...g,visitorBoost:(g.visitorBoost||0)+1,log:['望遠鏡觀察外界後，附近倖存者更容易注意到書店。',...g.log].slice(0,40)}));setAlert({title:'望遠鏡觀察',text:'明天或許會有倖存者來。'});}
 function openTelescope(){const scenes=game.phase==='day'?['day-01.webp','day-02.webp','day-03.webp']:Array.from({length:9},(_,i)=>`night-0${i+1}.webp`);setTelescope({image:asset(random(scenes)),text:random(['遠處有倖存者沿著街角移動。','一道感染者的影子穿過雨幕，消失在廢車之間。','幾隻野生動物正在倒塌的建築附近覓食。','街區的高樓已經破敗，窗戶在風裡搖晃。','路上散落著撞毀的車輛，遠方沒有救援燈號。','你看見遠方微弱的燈光，像是有人仍在堅持。'])});}
 function openWindowView(){const bad=['陰天','雨天','大雨天','雷雨天','颱風','霧天'].includes(game.weather?.sky),group=game.phase==='night'?'night':bad?'cloudy':'day',images={night:['窗戶圖1-晚上.webp','窗戶圖2-晚上.webp'],cloudy:['窗戶圖1-陰天.webp','窗戶圖2-陰天.webp'],day:['窗戶圖1-白天.webp','窗戶圖2-白天.webp']};const reflections={night:['街燈早已熄滅，玻璃映著身後那盞小燈。我想，只要它還亮著，明天就有人能找到回來的路。','夜色把遠方的街道藏了起來。今天離開的人，不知道是否也找到一扇能安心休息的窗。','安靜下來後，才聽見自己的疲倦。先睡一覺吧，明天還有人需要這裡。'],cloudy:['雲層壓得很低，遠方的街景像還沒乾透的水彩。我把擔心放一旁，先把今天能做的事做好。','雨聲讓我想起今天來訪的人。他們走進門時都很冷，至少這裡替他們留住了一點暖意。','天色不太好，但窗台上的書仍然清楚。只要還能讀、還能寫，我們就沒有完全失去方向。'],day:['陽光落在窗台那疊書上，像提醒我修補生活有時從讀完一頁開始。','窗外難得亮了起來。我把這份光記下來，也希望今天來敲門的人能看見它。','晨光照進來時，昨夜的疲倦好像淡了一點。今天再試著替大家守住一個安穩的地方。']};setWindowView({image:asset(random(images[group])),title:game.phase==='night'?'夜色中的窗':'眺望窗外',text:random(reflections[group])});}
 function resolveVisitor(action){
  const visitor=game.incoming.find(v=>v.id===selectedVisitorId);if(!visitor)return;if(visitor.kind==='trade'&&action==='accept')playRandomVisitorSfx();
  const books={...game.books},resources={...game.resources},equipment=[...game.equipment],lodgers=[...game.lodgers],supplies={...game.supplies};let line='';
  if(visitor.kind==='stay'){
   if(action==='accept'){lodgers.push({...visitor,daysLeft:visitor.days});line=random([visitor.name+'鬆了一口氣：「謝謝你，我會幫忙整理閱覽室。」',visitor.name+'輕聲說：「能安全睡一晚，已經很好了。」','「我會記得你們的善意。」'+visitor.name+'抱緊行李，點了點頭。']);}
   else line=random([visitor.name+'點點頭：「我明白，還是謝謝你聽我說。」','對方失望地道謝，轉身去找別的避雨處。',visitor.name+'低聲說：「我會再想辦法的。」']);
  }else if(visitor.kind==='trouble'){
   if(action==='psychology'||action==='book'){
    const title=action==='psychology'?'犯罪心理學':random(Object.keys(books).filter(k=>books[k]>0));
    if(title&&books[title]>0){books[title]--;line=random([visitor.name+'慢慢冷靜下來：「我只是太害怕了……謝謝你願意聽我說。」','對方放低聲音：「我以為你們也會把我趕走。抱歉。」','你和'+visitor.name+'談了好一會兒，對方終於收起怒氣。'])+' 你用《'+title+'》陪他梳理了心情。';}
    else line=visitor.name+'看著空蕩蕩的書架，怒氣再次湧上來。';
   }
   else{const available=Object.keys(books).filter(k=>books[k]>0);if(available.length){const title=random(available);books[title]--;line=random([visitor.name+'怒氣沖沖地離開，還撞落一本《'+title+'》。','你沒有安撫成功，'+visitor.name+'帶著一本《'+title+'》離開。']);}else line=visitor.name+'鬧了一陣後離去。';}
  }else if(action==='accept'&&(books[visitor.book]||0)>0){
   books[visitor.book]--;if(visitor.resource)resources[visitor.resource]=clamp(resources[visitor.resource]+visitor.gain);
   Object.entries(visitor.loot||{}).forEach(([key,value])=>supplies[key]=(supplies[key]||0)+value);
   if(Math.random()<.38){const title=random(Object.keys(startingBooks));books[title]=(books[title]||0)+1;visitor.bonusBook=title;}
   if(visitor.item)equipment.push(visitor.item);
   const goods=Object.entries(visitor.loot||{}).map(([key,value])=>foodNames[key]?foodNames[key]+' '+value:({cleanWater:'乾淨水 '+value,seeds:'種子 '+value})[key]).filter(Boolean);
   line='與'+visitor.name+'完成交易，得到'+(goods.join('、')||visitor.item||'補給')+(visitor.bonusBook?'，還額外得到《'+visitor.bonusBook+'》。':'。');
  }else line=random([visitor.name+'收回物資：「沒關係，或許下次再談。」','對方笑了笑：「我去別處問問，祝你們平安。」',visitor.name+'有些失望，但仍把交換物收好。']);
  const reaction=random(visitor.kind==='trade'?['「這些東西就交給你了，祝你們好好活下去。」','「書比我想像中更有用，謝謝你願意交換。」','「希望這些補給能撐過幾天。」']:visitor.kind==='stay'?['「我會記得你們今天的善意。」','「這裡聞起來有書和咖啡的味道，真安心。」','「謝謝你們讓我有地方休息。」']:['「我今天太慌張了，對不起。」','「我不想傷害任何人，只是被逼急了。」','「我會離開，請別追來。」']);
  line+=' '+reaction;
  const welcomed=['accept','psychology','book'].includes(action),key=visitor.characterId||visitor.id,old=game.relationships?.[key]||{trust:0,visits:0};
  const relationships={...(game.relationships||{}),[key]:{trust:Math.max(-3,Math.min(4,old.trust+(welcomed?1:-1))),visits:old.visits+1,lastAction:welcomed?'welcomed':'refused',person:{...visitor,characterId:key}}};
  const rescuedCount=game.rescuedCount+(welcomed&&(visitor.kind==='stay'||visitor.kind==='trouble')?1:0);
  setGame({...game,books,resources,equipment,lodgers,supplies,relationships,rescuedCount,incoming:game.incoming.filter(v=>v.id!==visitor.id),log:[line,...game.log].slice(0,40)});setAlert({title:'對方的反應',text:(visitor.story||'')+'\n\n'+line});
  if(visitor.reunion||visitor.kind==='stay'||Math.random()<.08){const image=asset('survivor-memory-'+(1+Math.floor(Math.random()*6))+'.webp');setSurvivorScene({image,title:visitor.reunion?'再次相遇':'分別時刻',text:visitor.reunion?(welcomed?`${visitor.name}認出了書店門口的燈，這次還帶來了家人與街區的新消息。`:`${visitor.name}在門口停了一下，記得上次被拒絕的滋味，最後仍默默離開。`):`${visitor.name}${welcomed?'在離開前回頭道謝，答應有機會會再回來。':'收好行李，消失在街道盡頭。'}`});}
  setSelectedVisitorId(null);
 }
 function useBook(title){
  if(!title||(game.books[title]||0)<1||!canUseBook(title,game))return;
  const key=title==='基礎電學'?'power':title==='流體力學'?'cleanWater':title==='給排水系統解析'?'water':title==='音樂 CD'?'morale':null;
  if(!key)return;
  const books={...game.books},resources={...game.resources},supplies={...game.supplies};books[title]--;
  const before=key==='cleanWater'?supplies.cleanWater:resources[key],increase=key==='power'?24:key==='water'?22:key==='cleanWater'?22:18,after=key==='cleanWater'?before+increase:clamp(before+increase);
  if(key==='cleanWater')supplies.cleanWater=after;else resources[key]=after;
  const labels={power:'發電與照明',water:'給水與管線',cleanWater:'儲水量・乾淨水',morale:'空間舒適度'},unit=key==='cleanWater'?' 份':'%';
  setGame({...game,books,resources,supplies,log:['使用《'+title+'》，'+labels[key]+'增加 '+(after-before)+unit+'。',...game.log].slice(0,40)});
  setToast({key:key==='morale'?'comfort':key,amount:after-before});setTimeout(()=>setToast(null),2100);setPendingBook(null);setSelectedBook(null);
 }
 function plantCrop(){
  if(game.phase!=='night'||game.supplies.seeds<1)return;
  const days=2+Math.floor(Math.random()*4),kind=Math.random()<.5?'蔬菜':'水果',name=random(kind==='蔬菜'?['番茄','小白菜','紅蘿蔔','香草']:['草莓','蘋果','柑橘','葡萄']);
  const crop={id:'crop-'+Date.now()+'-'+Math.random(),kind,name,daysLeft:days,image:random(plantedPotImages)};
  setGame({...game,supplies:{...game.supplies,seeds:game.supplies.seeds-1},crops:[...game.crops,crop],log:['播下 '+name+' 種子，約 '+days+' 天成熟；雨水槽會自動澆灌。',...game.log].slice(0,40)});
 }
 function sleepToMorning(){const meals=2+Math.floor(Math.random()*2),remaining={...game.supplies},picks=[];for(let i=0;i<meals;i++){const available=Object.keys(foodNames).filter(k=>remaining[k]>0);if(!available.length){picks.push(null);continue;}const key=random(available);remaining[key]--;picks.push(key);}const nextDay=game.day+1,weather=makeWeather(nextDay%8===0?random(seasons):game.season,nextDay,game.difficulty),rain=['雨天','大雨天','雷雨天','颱風'].includes(weather.sky)?(weather.sky==='大雨天'?22+Math.floor(Math.random()*13):weather.sky==='雷雨天'||weather.sky==='颱風'?18+Math.floor(Math.random()*9):10+Math.floor(Math.random()*9)):weather.sky==='多雲天'?Math.floor(Math.random()*4):0,water=Math.min(game.supplies.cleanWater+rain,1+Math.floor(Math.random()*2));setSleepPreview({meals,picks,water,weather,rain});if(weather.sky==='颱風'){setStormPicks([]);setStormPrep(true);}else setSleepConfirm(true);}
 function confirmStormPreparation(){setStormPrep(false);setSleepConfirm(true);}
 function careForPets(action){
  const hungryPets=game.pets.filter(p=>p.hungry);if(action==='feed'&&(!hungryPets.length||!game.supplies.food)){setAlert({title:'貓狗的晚餐',text:!hungryPets.length?'今天的貓狗看起來都不餓。':'糧食不足，店長只能摸摸牠們，答應明天再找食物。'});return;}
  const supplies={...game.supplies},pets=game.pets.map(p=>({...p}));let message='';
  if(action==='feed'){const fed=Math.min(hungryPets.length,supplies.food);supplies.food-=fed;let remaining=fed;for(const pet of pets)if(pet.hungry&&remaining>0){pet.hungry=false;remaining--;}message=`店長分出 ${fed} 份糧食，飢餓的貓狗安心地吃了起來。`;}
  else message='店長蹲下來陪牠們玩了一會兒。溫暖的呼嚕聲和搖晃的尾巴讓疲倦稍稍散去。';
  const resources={...game.resources,morale:clamp(game.resources.morale+(action==='feed'?2:3))};setGame({...game,supplies,pets,resources,petFedDay:action==='feed'?game.day:game.petFedDay,petPlayedDay:action==='interact'?game.day:game.petPlayedDay,log:[message,...game.log].slice(0,40)});setAlert({title:action==='feed'?'分出一餐':'貓狗的陪伴',text:message+' 空間舒適度略微提升。'});
 }
 function advanceToMorning(){
  if(game.phase!=='night'||room?.id!=='manager')return;
  const resources={...game.resources},supplies={...game.supplies},beforeSupplies={...game.supplies},beforeCrops=game.crops.length,books=game.books;
  const nextDay=game.day+1,weather=sleepPreview?.weather||makeWeather(nextDay%8===0?random(seasons):game.season,nextDay,game.difficulty),rates=DIFFICULTIES[game.difficulty]||DIFFICULTIES.easy;
  let rain=0;
  if(['雨天','大雨天','雷雨天','颱風'].includes(weather.sky)){rain=weather.sky==='大雨天'?22+Math.floor(Math.random()*13):weather.sky==='雷雨天'||weather.sky==='颱風'?18+Math.floor(Math.random()*9):10+Math.floor(Math.random()*9);}
  else if(weather.sky==='多雲天')rain=Math.floor(Math.random()*4);
  supplies.cleanWater+=rain;
  const climateDrain=game.weather?.sky==='雷雨天'?4:['雨天','大雨天','霧天'].includes(game.weather?.sky)?2:0;
  resources.power=clamp(resources.power-(12+climateDrain+(game.season==='冬季'?2:0))*rates.drain+(books['基礎電學']||0)*1.45+(game.equipment.includes('發電機零件')?2:0));
  resources.water=clamp(resources.water-(10+climateDrain+(game.season==='夏季'?2:0))*rates.drain+(books['給排水系統解析']||0)*.75);
  resources.morale=clamp(resources.morale-7*rates.drain+(books['心理學']||0)*.52+(books['音樂 CD']||0)*.52);
  const preparations=sleepPreview?.stormPicks||[];
  const emergencyRisk=weather.sky==='颱風'?1:weather.sky==='雷雨天'?.2:weather.sky==='大雨天'?.12:weather.sky==='雨天'?.08:0;
  const risks=weather.sky==='颱風'?['blackout','pipe'].filter(x=>!preparations.includes(x)):['blackout','pipe'];
  const preparedRisk=preparations.length?Math.max(.25,emergencyRisk-.35*preparations.length):emergencyRisk;
  const emergency=Math.random()<preparedRisk&&risks.length?random(risks):null;
  if(emergency==='blackout')resources.power=0;
  if(emergency==='pipe')resources.water=Math.floor(Math.random()*51);
  const watering=game.crops.length,canWater=supplies.cleanWater>=watering||(preparations.includes('crops')&&weather.sky==='颱風');
  if(canWater&&supplies.cleanWater>=watering)supplies.cleanWater-=watering;else if(!canWater)resources.water=clamp(resources.water-8);
  const cropHarvests=[],crops=[];
  game.crops.forEach(crop=>{
   if(canWater){const n=Math.max(0,crop.daysLeft-1);if(n===0)cropHarvests.push(crop);else crops.push({...crop,daysLeft:n});}
   else crops.push(crop);
  });
  cropHarvests.forEach(c=>supplies[c.kind==='水果'?'fruits':'vegetables']++);
  // Consume two or three portions from the available food. Empty stores mean hunger and lower comfort.
  const meals=sleepPreview?.meals||2+Math.floor(Math.random()*2),picks=sleepPreview?.picks||[];let eaten=0,hungry=0;
  for(let i=0;i<meals;i++){const key=picks[i];if(!key||!supplies[key]){hungry++;continue;}supplies[key]--;eaten++;}
  const waterDrunk=Math.min(supplies.cleanWater,sleepPreview?.water||1+Math.floor(Math.random()*2));supplies.cleanWater-=waterDrunk;
  const thirsty=waterDrunk===0;
  if(hungry)resources.morale=clamp(resources.morale-hungry*9);
  if(thirsty)resources.morale=clamp(resources.morale-8);
  const neglectedPets=game.pets.filter(p=>p.hungry).length;
  if(neglectedPets)resources.morale=clamp(resources.morale-Math.min(6,neglectedPets*2));
  if(resources.power===0||resources.water===0)resources.morale=clamp(resources.morale-8);
  const manuscript=clamp(game.manuscript+manuscriptGain(resources));
  const lodgers=[],farewells=[],gifts=[],booksAfter={...books};
  game.lodgers.forEach(p=>{
   if(p.daysLeft<=1){farewells.push(p.name+'留宿期滿，向你道別後離開。');return;}
   lodgers.push({...p,daysLeft:p.daysLeft-1});
   if(Math.random()<.24){const kind=random(['food','vegetables','fruits','cleanWater','seeds','book']);const amount=1+Math.floor(Math.random()*3);if(kind==='book'){const title=random(Object.keys(startingBooks));booksAfter[title]=(booksAfter[title]||0)+amount;gifts.push(p.name+'送來《'+title+'》 '+amount+' 本。');farewells.push(p.name+'分享了自己的故事，送你《'+title+'》 '+amount+' 本。');}else{supplies[kind]=(supplies[kind]||0)+amount;const label=({food:'糧食',vegetables:'蔬菜',fruits:'水果',cleanWater:'乾淨水',seeds:'種子'})[kind];gifts.push(p.name+'送來'+label+' '+amount+(['cleanWater','seeds'].includes(kind)?(kind==='seeds'?' 包。':' 份。'):' 份。'));farewells.push(p.name+'分享了'+label+' '+amount+(kind==='seeds'?' 包':' 份')+'作為謝禮。');}}
  });
  const arrivals=makeDay(nextDay,weather.season,game.visitorBoost||0,game.relationships,game.difficulty);
  const petGifts=[];arrivals.pets.forEach(p=>{if(p.gift){supplies[p.gift]=(supplies[p.gift]||0)+p.giftAmount;const name=({food:'糧食',vegetables:'蔬菜',fruits:'水果',seeds:'種子'})[p.gift];petGifts.push(`${p.name}叼來${name} ${p.giftAmount}${p.gift==='seeds'?' 包':' 份'}。`);}});
  const incident=rollNightIncident(resources,supplies,game.difficulty),nextLodgerEvent=createLodgerEvent(lodgers,game.difficulty);
  const infection=Math.random()<.3;
  if(infection){const available=Object.keys(booksAfter).filter(k=>booksAfter[k]>0);if(available.length){const title=random(available);booksAfter[title]--;farewells.push('夜間感染者在店外徘徊，撞壞一冊《'+title+'》。');}}
  const notes=[];
  if(preparations.length)notes.push('你提前準備了'+preparations.map(x=>({blackout:'備用電力',pipe:'屋頂防水',crops:'作物防風'}[x])).join('、')+'，部分災害影響已被減輕。');
  if(neglectedPets)notes.push('有貓狗餓著肚子度過夜晚，空間舒適度因此下降 '+Math.min(6,neglectedPets*2)+'%。');
  if(rain)notes.push(weather.sky+'，雨水過濾後增加 '+rain+' 份乾淨水。');
  notes.push('夜裡吃掉 '+eaten+' 份食物'+(hungry?'，有 '+hungry+' 餐沒有食物，只能挨餓。':'。')+' 喝掉 '+waterDrunk+' 份乾淨水'+(thirsty?'，目前沒有乾淨水可喝。':'。'));
  if(cropHarvests.length)notes.push('自動採收：'+cropHarvests.map(c=>c.name).join('、')+'，已存入倉儲。');
  notes.push(manuscriptRuleText(resources));
  if(incident)notes.push(incident.text);
  if(petGifts.length)notes.push(...petGifts);
  const warning=[resources.power<50&&'發電與照明低於 50%',resources.water<50&&'給水與管線低於 50%'].filter(Boolean);
  const emergencyText=emergency==='blackout'?'颱風與強風破壞供電，發電與照明已降至 0%。請到地下機房使用《基礎電學》搶修。':emergency==='pipe'?`暴雨沖壞給水管線，給水與管線降至 ${resources.water}%。請到地下機房使用《給排水系統解析》搶修。`:'';
  const bookChanges=Object.keys({...game.books,...booksAfter}).filter(k=>game.books[k]!==booksAfter[k]).map(k=>({title:k,before:game.books[k]||0,after:booksAfter[k]||0}));
  preparations.forEach(kind=>{if(kind==='blackout'&&booksAfter['基礎電學']>0)booksAfter['基礎電學']--;if(kind==='pipe'&&booksAfter['給排水系統解析']>0)booksAfter['給排水系統解析']--;if(kind==='crops'&&supplies.seeds>0)supplies.seeds--;});
  const nextGame={...game,day:nextDay,phase:'day',season:weather.season,weather,resources,books:booksAfter,supplies,crops,lodgers,manuscript,ending:manuscript>=100,endingKind:manuscript>=100?chooseEnding({...game,resources,books:booksAfter,supplies,lodgers,manuscript}):null,incoming:arrivals.incoming,pets:arrivals.pets.map(p=>({...p,hungry:Math.random()<.42})),visitorBoost:Math.max(0,(game.visitorBoost||0)-1),hungry:hungry>0,dayReport:{beforeSupplies, beforeCrops, afterSupplies:{...supplies}, afterCrops:crops.length, rain, harvests:cropHarvests.map(c=>c.name), eaten, waterDrunk, hungry, thirsty,beforeBooks:{...game.books},afterBooks:{...booksAfter},bookChanges},log:['第 '+nextDay+' 天白天開始。'+weather.season+'・'+weather.sky+'，有 '+arrivals.incoming.length+' 位倖存者來訪。',...notes,...farewells,...game.log].slice(0,40)};
  setGame(nextGame);setRoom(null);setSleepConfirm(false);setLodgerEvent(manuscript<100?nextLodgerEvent:null);
  if(manuscript>=100)setAlert(null);
  else if(incident||petGifts.length||emergency||gifts.length)setAlert({title:incident?.title||(emergency?'氣候緊急狀況':petGifts.length?'貓狗帶回補給':'留宿者的謝禮'),text:[incident?.text,emergencyText,...petGifts,...(gifts.length?['留宿者留下了禮物：',...gifts]:[])].filter(Boolean).join('\n')});
  else if(!arrivals.incoming.length)setAlert({title:'書店外很安靜',text:random(['今天沒有倖存者來訪。你忍不住想：外面的世界現在怎麼了？','鄰居們都還好嗎？希望大家平安，也希望救援隊真的會來。','今天仍等不到救援隊的消息。也許明天會有新的腳步聲。','門外沒有動靜，你望著遠方，不知道下一次相遇會在什麼時候。'])});
  else if(warning.length)setAlert({title:'機電系統警告',text:warning.join('、')+'，請到地下機房查看並使用館藏維護。'});
  else if(hungry||thirsty)setAlert({title:'今夜的休息結算',text:`吃掉 ${eaten} 份食物、喝掉 ${waterDrunk} 份乾淨水。${hungry?`還有 ${hungry} 餐沒有食物，店長餓著肚子入睡。`:''}${thirsty?'沒有乾淨水可喝。':''}`});
  if(manuscript<100){const cloudy=['陰天','雨天','大雨天','雷雨天','颱風','霧天'].includes(weather.sky),image=asset(random(cloudy?['窗戶圖1-陰天.webp','窗戶圖2-陰天.webp']:['窗戶圖1-白天.webp','窗戶圖2-白天.webp']));setDawnScene({weather,day:nextDay,image,text:random(dawnThoughts(weather,game.nickname))});}
 }
 function resolveLodgerEvent(choice){if(!lodgerEvent)return;const event=lodgerEvent,selected=event.choices[choice],lodgers=[...game.lodgers],guest=lodgers.find(p=>p.id===event.guestId);if(!selected||!guest)return;const resources={...game.resources},supplies={...game.supplies},relationships={...game.relationships},key=event.characterId,old=relationships[key]||{trust:0,visits:1,person:{...guest,characterId:key}};let impact='';if(selected.water){const spent=Math.min(supplies.cleanWater,selected.water[0]+Math.floor(Math.random()*(selected.water[1]-selected.water[0]+1)));supplies.cleanWater-=spent;impact+=`消耗乾淨水 ${spent} 份。`;}if(selected.morale)resources.morale=clamp(resources.morale+selected.morale);if(selected.leave){const index=lodgers.findIndex(p=>p.id===guest.id);if(index>=0)lodgers.splice(index,1);impact+='留宿者提前離開。';}else guest.daysLeft=Math.max(1,guest.daysLeft+(selected.days||0));relationships[key]={...old,trust:Math.max(-3,Math.min(5,old.trust+(selected.trust||0))),lastAction:'lodger-conversation'};setGame({...game,lodgers,resources,supplies,relationships,log:[selected.reply+' '+impact,...game.log].slice(0,40)});setLodgerEvent({...event,result:`${selected.reply} ${impact}`});}
 function openRadio(){setRadioMessage(random(['「……這裡是北區臨時避難點。若你們還聽得到，感染者會避開持續的強光。重複，強光能讓牠們停下來……」','「有人嗎？我們在舊車站地下室，門快撐不住了……請回答……」接著只剩下急促的呼吸和雜訊。','一個沙啞的聲音斷斷續續報出方位：「河堤……不要走橋面……水位還在上升……」','「今天有人用書頁生火，差點把整個倉庫燒掉。拜託，先確認乾燥再靠近火源。」','頻道裡傳來一陣像是笑聲的囈語，接著有人低聲說：「燈亮著的地方……牠們就不敢進來……」','純粹的白噪音持續了十幾秒。遠處彷彿有人敲了三下金屬門，然後一切歸於沉寂。','「補給隊提醒：雨水經過屋頂過濾後仍要檢查管線。若水壓忽高忽低，先關閉地下室主閥。」']));}
 function closeDay(){
  if(game.phase!=='day'||game.incoming.length)return;
  setGame({...game,phase:'night',log:['日落了，書店關門。請留在室內安排夜間行動。',...game.log].slice(0,40)});
 }
 function returnHome(){if(returningHome)return;setReturningHome(true);setTimeout(()=>{setNickname(game.nickname||'');setGender(game.gender||'female');setRoom(null);setJournalOpen(false);setAlert(null);setSleepConfirm(false);setTelescope(null);setShowLogin(true);setReturningHome(false);},520);}
 if(showLogin||!game.nickname)return <main className="login-screen"><section className="login-card"><div className="ornament"><Sparkles size={20}/></div><p className="eyebrow">A BOOKSTORE SHELTER · SURVIVAL JOURNAL</p><h1>書店避難所</h1><p className="subtitle">文明煉金術</p><div className="rule"><span>✳</span></div><p className="login-copy">夜幕之外危機四伏，<br/>在書頁和微光之間，守住明天。</p><form onSubmit={startNewGame}><label htmlFor="nickname">店長暱稱</label><input id="nickname" value={nickname} onChange={e=>setNickname(e.target.value)} maxLength={14} placeholder="輸入店長暱稱" autoFocus/><label>選擇店長</label><div className="gender-picker"><button type="button" className={gender==='female'?'selected':''} onClick={()=>setGender('female')}><img src={asset('cast/shopkeeper-female.webp')} alt=""/>女店長</button><button type="button" className={gender==='male'?'selected':''} onClick={()=>setGender('male')}><img src={asset('cast/shopkeeper-male.webp')} alt=""/>男店長</button></div><label htmlFor="difficulty">選擇遊戲難度</label><select id="difficulty" className="difficulty-picker" value={difficulty} onChange={e=>setDifficulty(e.target.value)}><option value="easy">Easy｜童話與溫拿鐵</option><option value="normal">Normal｜求生手冊與黑美式</option><option value="hard">Hard｜殘破史詩與無糖配方</option><option value="nightmare">Nightmare｜燃盡秩序</option></select>{game.nickname&&<button className="button secondary full continue-game" type="button" onClick={continueGame}>回到「{game.nickname}」的書店 <ArrowRight size={16}/></button>}<button className="button primary full" type="submit">推開書店的門 <ArrowRight size={16}/></button></form><small className="save-caption">遊戲進度會自動保存在這台裝置</small>{game.ending&&<div className="login-books"><a href="https://cxc.today/@sophia810130/work/63001" target="_blank" rel="noreferrer"><BookOpen size={18}/>《末世之燃盡秩序》</a><a href="https://cxc.today/@sophia810130/work/30340" target="_blank" rel="noreferrer"><BookOpen size={18}/>《末世之水系異能生存》</a></div>}</section></main>;
 const currentRoom=room,activePets=game.pets.filter(p=>p.roomId===currentRoom?.id),lodgers=currentRoom?.id==='reading'?game.lodgers:[];
 const selectedVisitor=game.incoming.find(v=>v.id===selectedVisitorId);
 return <main className={'world-app'+(returningHome?' home-transition-out':'')}>
  <header className="world-topbar"><div className="world-brand"><span>✳</span><b>書店避難所</b><small>文明煉金術</small></div>{!currentRoom&&<div className="world-actions"><button className="home-button" onClick={returnHome}>回到登入畫面</button></div>}</header>
  {assetLoading&&<div className="asset-loading-overlay" role="status" aria-live="polite"><section><span className="loading-spark">✳</span><h2>正在為避難所點亮燈光</h2><p>整理房間、人物與書架的影像…</p><div className="loading-track"><i style={{width:assetLoadProgress+'%'}}/></div><small>{assetLoadProgress}%</small></section></div>}
   {openingIntro&&(()=>{const slide=prologueSlides[prologueIndex]||prologueSlides[0];return <div className={'opening-intro prologue-intro '+(prologueClosing?'prologue-closing':'')} role="dialog" aria-modal="true" aria-label="故事序章"><section className="prologue-stage" key={prologueIndex}>
    <img className="prologue-image" src={asset(slide.image)} alt="" onError={e=>{e.currentTarget.style.display='none';}}/>{slide.fadeImage&&<img className="prologue-image prologue-image-after" src={asset(slide.fadeImage)} alt="" onError={e=>{e.currentTarget.style.display='none';}}/>}<div className="prologue-vignette"/>
    <div className="prologue-copy"><div className="prologue-text">{slide.text.map((line,index)=><p key={index} className={line.startsWith('（')?'prologue-note':line.startsWith('「')?'prologue-dialogue':'prologue-paragraph'} style={{'--line-index':index}}>{line.replaceAll('[[YOU]]',game.gender==='female'?'妳':'你').split(/(【[^】]+】)/g).map((part,partIndex)=>part.startsWith('【')&&part.endsWith('】')?<strong className="prologue-emphasis" key={partIndex}>{part.slice(1,-1)}</strong>:part)}</p>)}</div></div>
    <div className="prologue-controls"><button className="button primary" onClick={advancePrologue}>{prologueIndex===prologueSlides.length-1?'走進書店':'繼續'} <ArrowRight size={17}/></button><button className="prologue-skip" onClick={skipPrologue}>跳過序章</button></div>
   </section></div>;})()}
   {!openingIntro&&prologueClosing&&<div className="prologue-blackout" aria-hidden="true"/>}

   <main className={'world-main '+(stormPrep?'storm-shake ':'')+(gameReveal?'prologue-game-reveal':'')} id="top" onClickCapture={handleTutorialClick}>
   <BuildingOverview selectedRoom={currentRoom} onSelectRoom={enterRoom} phase={game.phase} difficulty={game.difficulty} musicMuted={musicMuted} onToggleMusic={toggleMusic} onRadio={openRadio} incomingCount={game.incoming.length} onCloseDay={closeDay} pets={game.pets} weather={{...game.weather,day:game.day}} manuscript={game.manuscript} progressOpen={progressOpen} onToggleProgress={()=>setProgressOpen(v=>!v)} unfinishedTasks={unfinishedTasks(game)} characterImage={asset('cast/shopkeeper-'+game.gender+'.webp')} onOpenJournal={()=>setJournalOpen(true)} journalText={game.log[0]} onCycleInfo={()=>{if(!tutorialActive)setExplainer({title:"日夜經營節奏",text:"白天接待倖存者，夜晚整理設施、播種與休息。點擊「進入夜晚」或「休息」才會推進一天；教學中不會推進時間。"});}}>
    <div className="room-actors">
     {currentRoom?.id==='store'&&game.phase==='day'&&game.incoming.map((person,index)=><div className="walking-actor visitor-actor" key={person.id} onClick={()=>{playRandomVisitorSfx();setSelectedVisitorId(person.id);}} style={{'--actor-x':(9+index*20)+'%','--walk-delay':index*.65+'s','--bubble-lift':(index%4*42)+'px',pointerEvents:'auto',cursor:'pointer'}}>
      <button className="head-bubble visitor-bubble" onClick={e=>{e.stopPropagation();playRandomVisitorSfx();setSelectedVisitorId(person.id);}} aria-label={'查看'+person.name+'的需求'}>{person.bubble|| (person.kind==='trade'?'今天帶了些物資，想跟你談談交易。':person.kind==='stay'?'我走了很久，可以借住一晚嗎？':'外面太難熬了，我需要一些幫助！')}</button><img src={person.image} alt={person.name}/><span className="actor-name">{person.name}</span>
     </div>)}
     {lodgers.map((p,index)=><div className="walking-actor lodger-actor" key={p.id} style={{'--actor-x':(17+index*27)+'%','--walk-delay':index*.7+'s'}}><div className="head-bubble lodging-bubble">「{p.story||'謝謝你收留我。'}」</div><img src={p.image} alt={p.name}/><span className="actor-name">{p.name}・留宿</span></div>)}
     {activePets.map((p,index)=><div className={'pet-actor pet-'+index} key={p.id} style={{'--pet-x':p.x+'%'}} role="button" tabIndex={0} aria-label={p.name+'，點擊互動'} onClick={()=>setPetDialog({id:p.id,text:random(petLines[p.kind]||petLines['貓咪'])})} onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();setPetDialog({id:p.id,text:random(petLines[p.kind]||petLines['貓咪'])});}}}>{petDialog?.id===p.id&&<span className="pet-chat-bubble">{petDialog.text}</span>}<img src={p.image} alt={p.name}/><span className="pet-name">{p.name}・點我互動</span></div>)}
     {currentRoom?.id==='roof'&&<button className="scene-telescope" onClick={openTelescope} aria-label="使用望遠鏡"><img src={asset('telescope.webp')} alt="望遠鏡"/><span>望遠鏡・點擊觀察</span></button>}
     {currentRoom?.id==='roof'&&game.crops.map((crop,index)=><div className="planted-pot" key={crop.id} style={{left:(8+index*10)+'%','--pot-delay':index*.2+'s'}}><img src={asset(crop.image||plantedPotImages[(index+game.day)%plantedPotImages.length])} alt={crop.name+'種植盆'}/><small>{crop.name}<br/>約 {crop.daysLeft} 天</small></div>)}
    </div>
   </BuildingOverview>
   {currentRoom&&<RoomContents key={currentRoom.id} room={currentRoom} game={game} selectedBook={selectedBook} setSelectedBook={setSelectedBook} useBook={useBook} plantCrop={plantCrop} sleepToMorning={sleepToMorning} onPetCare={careForPets} selectedVisitor={selectedVisitor} resolveVisitor={resolveVisitor} deferVisitor={deferVisitor} onChooseVisitor={setSelectedVisitorId} openJournal={()=>setJournalOpen(true)} toast={toast} onConfirmBook={()=>setPendingBook(selectedBook)} onTelescope={openTelescope} onLookWindow={openWindowView} onExplain={setExplainer} tutorialActive={tutorialActive}/>}
  </main>
   {tutorialActive&&<>{tutorialStep<5?<><div className="tutorial-dimmer" style={tutorialSpot?{'--spot-x':tutorialSpot.x+'px','--spot-y':tutorialSpot.y+'px','--spot-w':Math.max(110,tutorialSpot.w+26)+'px','--spot-h':Math.max(72,tutorialSpot.h+24)+'px'}:undefined}/>{tutorialTarget&&<div className="tutorial-target-outline" style={tutorialSpot?{left:tutorialSpot.x-tutorialSpot.w/2-4,top:tutorialSpot.y-tutorialSpot.h/2-4,width:tutorialSpot.w+8,height:tutorialSpot.h+8}:undefined}/>}<section className="tutorial-guide" role="dialog" aria-live="polite"><span>新手教學　{tutorialStep+1} / 5</span><h2>{tutorialCopy[tutorialStep]?.title}</h2><p>{tutorialCopy[tutorialStep]?.text}</p><small>{tutorialStep===2&&!room?'請先從全景進入地下機房。':tutorialStep===4&&room?'點擊左上角返回全景。':tutorialStep===0&&!room?'請點擊發光的「一樓倉儲室」。':tutorialStep===1?'請點選一本館藏，這一步不會使用或消耗它。':tutorialStep===2?'請點擊機房裡的「發電與照明」狀態。':tutorialStep===3?'請點擊「給水與管線」狀態。':'請點擊上方的季節與日期資訊。'}</small></section></>:<section className="tutorial-guide tutorial-complete" role="dialog"><span>新手教學完成</span><h2>基本教學完成</h2><p>從今天開始，這間書店的未來就交給你了。</p><button className="button primary" onClick={finishTutorial}>進入書店 <ArrowRight size={17}/></button></section>}</>}

  {journalOpen&&<div className="journal-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)setJournalOpen(false);}}><aside className="journal-drawer"><div className="journal-head"><div><span>店長手札・第 {game.day} 天</span><h2>今日手記</h2></div><button onClick={()=>setJournalOpen(false)} aria-label="關閉"><X size={19}/></button></div><div className="journal-entries">{game.log.map((line,i)=><article key={i}><i>{String(i+1).padStart(2,'0')}</i><p>{line}</p></article>)}</div><small>記錄隨遊戲進度自動保存</small></aside></div>}
  {pendingBook&&<ConfirmBook title={pendingBook} game={game} onCancel={()=>setPendingBook(null)} onUse={()=>useBook(pendingBook)}/>}
  {sleepConfirm&&<div className="confirm-backdrop"><section className="confirm-card"><span>夜間休息・第 {game.day} 天</span><h2>入睡前的預估消耗</h2><p>今晚會隨機吃掉 {sleepPreview?.meals||2} 份：{Object.entries(foodNames).map(([key,label])=>{const n=sleepPreview?.picks?.filter(k=>k===key).length||0;return n?`${label} ${n} 份`:null;}).filter(Boolean).join('、')||'目前沒有可吃的食物'}。{sleepPreview?.picks?.some(k=>!k)?`還有 ${sleepPreview.picks.filter(k=>!k).length} 餐會餓肚子。`:''}</p><p>今晚會喝掉 {sleepPreview?.water||0} 份乾淨水。確認後進入新的一天。</p><div><button className="button secondary" onClick={()=>setSleepConfirm(false)}>取消</button><button className="button primary" onClick={advanceToMorning}>確認休息</button></div></section></div>}
  {stormPrep&&<div className="forecast-layer"><section className="confirm-card storm-card"><span>天候警報・第 {sleepPreview?.weather?.day} 天</span><h2>颱風將至</h2><p>風聲從屋頂傳來，燈泡閃了幾下，水管也開始震動。睡前可準備下列措施；每項會消耗一項館藏或種子。</p><div className="storm-options">{[['blackout','備用電力','消耗《基礎電學》1 本，可避免停電。',game.books['基礎電學']>0],['pipe','加固屋頂與管線','消耗《給排水系統解析》1 本，可避免管線破裂。',game.books['給排水系統解析']>0],['crops','保護作物','消耗種子 1 包，讓菜園避開風雨並維持生長。',game.supplies.seeds>0]].map(([id,label,desc,available])=><button key={id} className={stormPicks.includes(id)?'selected':''} disabled={!available} onClick={()=>setStormPicks(p=>p.includes(id)?p.filter(x=>x!==id):[...p,id])}><b>{label}</b><small>{available?desc:'目前缺少準備材料'}</small></button>)}</div><div><button className="button secondary" onClick={confirmStormPreparation}>不做準備</button><button className="button primary" onClick={()=>{setSleepPreview(p=>({...p,stormPicks}));confirmStormPreparation();}}>完成準備</button></div></section></div>}
  {roomReport&&<div className="confirm-backdrop"><section className="confirm-card"><button className="confirm-x" onClick={()=>setRoomReport(null)}><X size={18}/></button><span>第 {game.day} 天・更新</span><h2>{roomReport.title}</h2><p className="multiline">{roomReport.text}</p><div><button className="button primary" onClick={()=>setRoomReport(null)}>知道了</button></div></section></div>}
  {radioMessage&&<div className="confirm-backdrop radio-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)setRadioMessage(null);}}><section className="confirm-card radio-card"><button className="confirm-x" onClick={()=>setRadioMessage(null)} aria-label="關閉"><X size={18}/></button><span>一樓咖啡書店・短波頻道</span><h2>收音機消息</h2><p className="multiline radio-copy">{radioMessage}</p><div><button className="button primary" onClick={()=>setRadioMessage(null)}>關閉頻道</button><button className="button secondary" onClick={openRadio}>重新調頻</button></div></section></div>}
  {lodgerEvent&&<div className="confirm-backdrop lodger-event-backdrop"><section className="confirm-card lodger-event-card"><span>留宿生活・第 {game.day} 天</span><h2>{lodgerEvent.title}</h2><p>{lodgerEvent.result||lodgerEvent.story}</p>{lodgerEvent.result?<div><button className="button primary" onClick={()=>setLodgerEvent(null)}>繼續今天</button></div>:<div className="lodger-event-choices">{lodgerEvent.choices.map((choice,index)=><button key={choice.label} className={'button '+(index===0?'primary':'secondary')} onClick={()=>resolveLodgerEvent(index)}>{choice.label}</button>)}</div>}</section></div>}
  {explainer&&<div className="confirm-backdrop"><section className="confirm-card"><button className="confirm-x" onClick={()=>setExplainer(null)}><X size={18}/></button><span>物資與系統指南</span><h2>{explainer.title}</h2><p>{explainer.text}</p><div><button className="button primary" onClick={()=>setExplainer(null)}>知道了</button></div></section></div>}
  {alert&&<div className="confirm-backdrop alert-layer"><section className="confirm-card"><button className="confirm-x" onClick={()=>setAlert(null)}><X size={18}/></button><span>書店日誌</span><h2>{alert.title}</h2><p className="multiline">{alert.text}</p><div><button className="button primary" onClick={()=>setAlert(null)}>知道了</button></div></section></div>}
  {dawnScene&&<div className="story-transition dawn-transition" style={{'--scene-tint':weatherTint(dawnScene.weather)}}><section><img src={dawnScene.image} alt="窗外天色與晨間手稿"/><DraggableStoryCard className="story-copy"><span>{dawnScene.weather.season}・{dawnScene.weather.sky}・第 {dawnScene.day} 天</span><p>{dawnScene.text}</p><button className="button primary" onClick={()=>setDawnScene(null)}>迎接今天 <Sun size={16}/></button></DraggableStoryCard></section></div>}
  {windowView&&<div className="confirm-backdrop window-view-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)setWindowView(null);}}><section className="window-view-modal" role="dialog" aria-modal="true" aria-label="眺望窗外"><button className="confirm-x" onClick={()=>setWindowView(null)} aria-label="關閉"><X size={18}/></button><img src={windowView.image} alt={windowView.title}/><div><span>{game.weather.season}・{game.weather.sky}・{game.phase==='night'?'夜晚':'白天'}</span><h2>{windowView.title}</h2><p>{windowView.text}</p><button className="button primary" onClick={()=>setWindowView(null)}>回到休息室</button></div></section></div>}
  {survivorScene&&<div className="story-transition survivor-transition"><section><img src={survivorScene.image} alt="倖存者在街道上道別或回訪"/><DraggableStoryCard className="story-copy"><span>書店外・重要相遇</span><h2>{survivorScene.title}</h2><p>{survivorScene.text}</p><button className="button primary" onClick={()=>setSurvivorScene(null)}>繼續</button></DraggableStoryCard></section></div>}
  {telescope&&<div className="confirm-backdrop telescope-layer"><section className="telescope-modal"><img src={telescope.image} alt="望遠鏡觀察到的末世風景"/><div><span>望遠鏡・{game.phase==='day'?'白天':'夜晚'}</span><p>{telescope.text}</p><button className="button primary" onClick={leaveTelescope}>離開望遠鏡</button></div></section></div>}
  {toast&&createPortal(<div className="global-toast" role="status">{({power:'發電與照明',water:'給水與管線',comfort:'空間舒適度',cleanWater:'儲水量・乾淨水'})[toast.key]} +{toast.amount}{toast.key==='cleanWater'?' 份':'%'}</div>,document.body)}
  {game.ending&&<div className="ending-overlay"><section className="ending-card cinematic-ending"><div className="ending-panels"><div className="ending-track">{['manager-room.webp','book-cafe.webp','reading-room.webp'].map(file=><img key={file} src={asset(file)} alt="書店空間的結局鏡頭"/>)}</div></div><span>✳　THE LAST MANUSCRIPT · 第 {game.day} 天</span><h2>{game.endingKind?.title||'手稿完成'}</h2><blockquote>{game.endingKind?.text||'「當秩序燃盡，知識是我們唯一留下的灰燼。」'}</blockquote><p>救助 {game.rescuedCount} 人・保存館藏 {Object.values(game.books).reduce((a,b)=>a+b,0)} 冊・設備平均 {Math.round((game.resources.power+game.resources.water+game.resources.morale)/3)}%</p><button className="button primary" onClick={returnHome}>回到登入畫面</button></section></div>}
 </main>;
}

function DraggableStoryCard({className,children}){
 const [offset,setOffset]=useState({x:0,y:0}),[drag,setDrag]=useState(null);
 return <div className={className} style={{'--drag-x':offset.x+'px','--drag-y':offset.y+'px'}} onPointerDown={e=>{if(e.target.closest('button'))return;e.currentTarget.setPointerCapture(e.pointerId);setDrag({x:e.clientX,y:e.clientY,startX:offset.x,startY:offset.y});}} onPointerMove={e=>{if(drag)setOffset({x:drag.startX+e.clientX-drag.x,y:drag.startY+e.clientY-drag.y});}} onPointerUp={()=>setDrag(null)} onPointerCancel={()=>setDrag(null)}>{children}</div>;
}
function ConfirmBook({title,game,onCancel,onUse}){
 const key=bookResourceKey(title),isCleanWater=key==='cleanWater',label={power:'發電與照明',water:'給水與管線',cleanWater:'儲水量・乾淨水',morale:'空間舒適度'}[key],before=isCleanWater?game.supplies.cleanWater:game.resources[key],increase=key==='power'?24:key==='water'||isCleanWater?22:18,after=isCleanWater?before+increase:clamp(before+increase);
 return <div className="confirm-backdrop"><section className="confirm-card"><button className="confirm-x" onClick={onCancel}><X size={18}/></button><span>館藏應急使用</span><h2>使用《{title}》？</h2><p>{isCleanWater?<>{label}將增加 <b>{increase} 份</b>（{before} → {after} 份）。</>:<>{label}將從 <b>{before}%</b> 回復到 <b>{after}%</b>。</>}</p><div><button className="button secondary" onClick={onCancel}>取消</button><button className="button primary" onClick={onUse}>使用這本館藏</button></div></section></div>;
}
function RoomContents({room,game,selectedBook,setSelectedBook,useBook,plantCrop,sleepToMorning,onPetCare,selectedVisitor,resolveVisitor,deferVisitor,onChooseVisitor,openJournal,toast,onConfirmBook,onTelescope,onLookWindow,onExplain}){
 const val=game.resources,sup=game.supplies;
 const [panelOffset,setPanelOffset]=useState({x:0,y:0}),[panelDrag,setPanelDrag]=useState(null);
 const panelDragProps={style:{transform:`translate(${panelOffset.x}px,${panelOffset.y}px)`},onPointerDown:e=>{if(!e.target.closest('.room-kicker'))return;e.currentTarget.setPointerCapture(e.pointerId);setPanelDrag({x:e.clientX,y:e.clientY,startX:panelOffset.x,startY:panelOffset.y});},onPointerMove:e=>{if(panelDrag)setPanelOffset({x:panelDrag.startX+e.clientX-panelDrag.x,y:panelDrag.startY+e.clientY-panelDrag.y});},onPointerUp:()=>setPanelDrag(null)};
 if(room.id==='store'&&selectedVisitor)return <div className="dialog-stage"><div className="dialog-person-label">{selectedVisitor.name}・{selectedVisitor.personality}</div><section className="player-dialog"><button className="dialog-close" onClick={deferVisitor}>稍後再談 <X size={14}/></button><span className="dialog-speaker">{selectedVisitor.name}・{selectedVisitor.voice}</span><p className="visitor-story">{selectedVisitor.story}</p>{selectedVisitor.kind==='trade'?<><p>{selectedVisitor.line}</p><div className="dialog-options"><button className="agree" disabled={!game.books[selectedVisitor.book]} onClick={()=>resolveVisitor('accept')}>同意交易</button><button onClick={()=>resolveVisitor('decline')}>拒絕交易</button></div></>:selectedVisitor.kind==='stay'?<><p>要讓 {selectedVisitor.name} 在二樓閱覽室留宿 {selectedVisitor.days} 天嗎？</p><div className="dialog-options"><button className="agree" onClick={()=>resolveVisitor('accept')}>同意留宿</button><button onClick={()=>resolveVisitor('decline')}>婉拒</button></div></>:<><p>可消耗一本館藏陪對方談談，或拒絕安撫。</p><div className="dialog-options"><button className="agree" disabled={!game.books['犯罪心理學']} onClick={()=>resolveVisitor('psychology')}>使用《犯罪心理學》安撫</button><button disabled={!Object.values(game.books).some(n=>n>0)} onClick={()=>resolveVisitor('book')}>拿一本館藏安撫</button><button className="danger-choice" onClick={()=>resolveVisitor('decline')}>拒絕安撫</button></div></>}</section></div>;
 if(room.id==='store')return <section className="room-contents cafe-contents" {...panelDragProps}><div className="room-kicker">一樓咖啡書店・白天接待</div><h2>今日來客</h2><p>{game.incoming.length?'點擊倖存者頭上的對話框，查看需求並回應。':'今日客人都已離開。'}</p><div className="cafe-guest-list">{game.incoming.map(p=><button key={p.id} onClick={()=>onChooseVisitor(p.id)}><img src={p.image} alt=""/><span>{p.name}</span><small>{p.kind==='trade'?'交易':p.kind==='stay'?'留宿':'找碴'}</small></button>)}</div></section>;
 if(room.id==='storage')return <section className="room-contents storage-contents" {...panelDragProps}><div className="room-kicker">一樓倉儲室・物資與館藏</div><h2>倉儲清單</h2><div className="resource-ledger"><ResourceRow id="water" icon={Droplets} title="儲水量・乾淨水" value={sup.cleanWater} unit="份" toast={toast} onExplain={onExplain}/><ResourceRow id="comfort" icon={Heart} title="空間舒適度" value={val.morale} unit="%" toast={toast} onExplain={onExplain}/></div><div className="store-supplies food-ledger">{[['🥫','糧食','food'],['🥬','蔬菜','vegetables'],['🍎','水果','fruits'],['🌱','種子','seeds']].map(([icon,name,key])=><button key={key} onClick={()=>onExplain({title:name,text:resourceHelp[key]})}><span><i>{icon}</i>{name}</span><strong>{sup[key]} <small>{key==='seeds'?'包':'份'}</small></strong></button>)}</div><div className="inventory-title"><span>館藏清單</span><small>選擇館藏可補給系統或舒適度</small></div><div className="inventory-books">{Object.entries(game.books).map(([title,count])=><button key={title} data-tutorial-target="book-select" className={selectedBook===title?'chosen':''} onClick={()=>setSelectedBook(title)}><BookOpen size={17}/><span>《{title}》</span><b>×{count}</b></button>)}</div>{selectedBook&&<div className="book-use-card"><span>《{selectedBook}》</span><p>{bookDescription(selectedBook)}</p><button className="button primary" disabled={!canUseBook(selectedBook,game)} onClick={onConfirmBook}>使用這本館藏 <ArrowRight size={15}/></button><button className="button secondary" onClick={()=>setSelectedBook(null)}>取消</button></div>}</section>;
 if(room.id==='machine')return <section className="room-contents machine-contents" {...panelDragProps}><div className="room-kicker">地下機房・設備檢視</div><h2>機電系統狀態</h2><p>穩定度隨天氣與每日耗損變化。點選數值查看維護方式。</p><StatusRow icon="⚡" title="發電與照明" value={val.power} detail={'《基礎電學》 '+game.books['基礎電學']+' 本'} toast={toast} id="power" onExplain={onExplain} tutorialActive={tutorialActive}/><StatusRow icon="⌁" title="給水與管線" value={val.water} detail={'《給排水系統解析》 '+game.books['給排水系統解析']+' 本・《流體力學》補充乾淨水'} toast={toast} id="water" onExplain={onExplain} tutorialActive={tutorialActive}/><StatusRow icon="♡" title="空間舒適度" value={val.morale} detail="供電與給水穩定會維持舒適度" toast={toast} id="comfort" onExplain={onExplain} tutorialActive={tutorialActive}/><div className="inventory-title"><span>館藏清單</span><small>使用後在倉儲清單同步更新</small></div><div className="inventory-books machine-books">{Object.entries(game.books).map(([title,n])=><button key={title} className={selectedBook===title?'chosen':''} onClick={()=>setSelectedBook(title)}><BookOpen size={17}/><span>《{title}》</span><b>×{n}</b></button>)}</div>{selectedBook&&<div className="book-use-card"><span>《{selectedBook}》</span><p>{bookDescription(selectedBook)}</p><button className="button primary" disabled={!canUseBook(selectedBook,game)} onClick={onConfirmBook}>使用這本館藏 <ArrowRight size={15}/></button><button className="button secondary" onClick={()=>setSelectedBook(null)}>取消</button></div>}</section>;
 if(room.id==='manager')return <section className="room-contents manager-contents" {...panelDragProps}><div className="room-kicker">地下室・店長休息室</div><h2>店長休息室</h2><div className="morale-reading" role="button" tabIndex="0" onClick={()=>onExplain({title:'空間舒適度',text:resourceHelp.comfort})}><Heart size={24}/><strong>{val.morale}%</strong><span>空間舒適度</span></div><button className="button secondary window-look-button" onClick={onLookWindow}>眺望窗外</button>{game.hungry&&<p className="hunger-note">{['肚子還是好餓……希望明天能找到食物。','空腹讓人難以集中精神。','店長摸了摸肚子，提醒自己要找些糧食。'][game.day%3]}</p>}{game.pets.length>0&&<div className="pet-care"><span>{game.phase==='night'?'今晚':'今天'}要陪陪貓狗嗎？{game.pets.some(p=>p.hungry)?'有孩子餓了。':'牠們正等著你。'}</span><button className="button secondary" disabled={game.petPlayedDay===game.day} onClick={()=>onPetCare('interact')}>{game.petPlayedDay===game.day?'已陪伴':'陪牠們玩'}</button><button className="button secondary" disabled={game.petFedDay===game.day||!game.supplies.food||!game.pets.some(p=>p.hungry)} onClick={()=>onPetCare('feed')}>{game.petFedDay===game.day?'已餵食':'分一份糧食'}</button></div>}{game.phase==='night'?<button className="button primary sleep-button" onClick={sleepToMorning}>休息，進入明天白天 <Sun size={16}/></button>:null}</section>;
 if(room.id==='roof')return <section className="room-contents roof-contents" {...panelDragProps}><div className="room-kicker">屋頂露臺・菜園與雨水過濾</div><h2>屋頂菜園</h2><div className="telescope-control"><Telescope size={22}/><span>望遠鏡</span><button onClick={onTelescope}>觀察外面的世界</button></div><div className="roof-stats"><button onClick={()=>onExplain({title:'儲水量・乾淨水',text:resourceHelp.water})}><Droplets size={20}/><span>儲水量・乾淨水</span><strong>{sup.cleanWater} <small>份</small></strong><em>雨天自動過濾・種植盆自動澆灌</em></button><button onClick={()=>onExplain({title:'種植盆',text:resourceHelp.crops})}><Sprout size={20}/><span>種植盆</span><strong>{game.crops.length} <small>盆</small></strong><em>成熟後自動採收入庫</em></button></div><div className="crop-list"><div className="crop-list-title">生長中的蔬果 <small>隨天數成熟</small></div>{game.crops.length?game.crops.map(c=><div className="crop-row" key={c.id}><span>🪴 {c.name}</span><small>約 {c.daysLeft} 天成熟・每日消耗乾淨水 1 份</small></div>):<p>目前沒有種植盆。蔬果不需照料，乾淨水會自動澆灌。</p>}</div><div className="roof-seed-count">倉儲種子：{sup.seeds} 包</div><button className="button secondary plant-button" disabled={game.phase!=='night'||sup.seeds<1} onClick={plantCrop}>{game.phase==='night'?'播下種子':'夜晚才能播種'} <Sprout size={16}/></button></section>;
 if(room.id==='reading')return <section className="room-contents reading-contents" {...panelDragProps}><div className="room-kicker">二樓閱覽室</div><h2>閱覽室的留宿客人</h2>{game.lodgers.length?<div className="lodger-list">{game.lodgers.map(p=><div key={p.id}><span>📚</span><strong>{p.name}</strong><small>還有 {p.daysLeft} 天・安靜閱讀中</small><p>{p.story||'來客在書架間找到一點安定。'} {p.voice||''}</p></div>)}</div>:<p>目前沒有留宿客人。倖存者提出住宿請求時，可以選擇收留。</p>}</section>;
 return null;
}
function bookTarget(title){return ['基礎電學','流體力學','給排水系統解析','音樂 CD'].includes(title);}
function bookResourceKey(title){return title==='基礎電學'?'power':title==='流體力學'?'cleanWater':title==='給排水系統解析'?'water':title==='音樂 CD'?'morale':null;}
function canUseBook(title,game){const key=bookResourceKey(title);return Boolean(key&&(game.books[title]||0)>0&&(key==='cleanWater'||game.resources[key]<100));}
function bookDescription(title){return title==='基礎電學'?'發電與照明穩定度 +24%。':title==='流體力學'?'儲水量・乾淨水 +22 份。':title==='給排水系統解析'?'給水與管線穩定度 +22%。':title==='音樂 CD'?'空間舒適度 +18%。':'可作為交易物，沒有直接補給效果。';}
function dawnThoughts(weather,name){const rain=['雨天','大雨天','雷雨天','颱風'].includes(weather.sky);return rain?[
 `${name}在窗邊醒來。雨水沿著玻璃往下爬，昨夜的風像還留在屋頂；至少，書店的燈仍亮著。`,
 `窗外的天色被雨洗成灰藍色。${name}聽著水滴敲窗，想起街角那些還沒等到消息的人。`,
 `天亮了，雨卻沒有停。${name}把手掌貼上冰涼的窗玻璃：今天也得替大家守住一點乾燥與光。`
]:[
 `${name}醒來時，晨光正落在攤開的手稿上。窗外的街道安靜得近乎陌生，但遠處似乎有鳥鳴。`,
 `一縷陽光穿過窗框，照亮昨晚沒寫完的句子。${name}深吸一口氣，提醒自己今天還有人會來敲門。`,
 `窗外的雲慢慢散開。${name}望著荒廢街景裡新冒出的綠意，忽然覺得明天還沒有被完全拿走。`
]}
function weatherTint(weather){return ({晴天:'#f5c87c',多雲天:'#b7a981',陰天:'#939b9a',霧天:'#aebbb8',雨天:'#607d87',大雨天:'#536879',雷雨天:'#536879',颱風:'#425569'})[weather?.sky]||'#d3b17c'}
function chooseEnding(game){const trust=Object.values(game.relationships||{}).reduce((n,r)=>n+(r.trust>0?1:0),0),saved=Object.values(game.books||{}).reduce((a,b)=>a+b,0),avg=(game.resources.power+game.resources.water+game.resources.morale)/3;if(game.rescuedCount>=3&&trust>=2&&avg>=58)return {title:'書店成為避難所',text:'「門沒有關上。留下的人把椅子排成一圈，讓每個新來的人都有地方坐下。」'};if(saved>=55&&game.rescuedCount>=1)return {title:'巡迴圖書站',text:'「我們把書裝上手推車，沿著還走得通的街道出發。每到一處，就留下一盞燈和一段故事。」'};return {title:'留給後人的手稿',text:'「店長把最後一頁夾進書裡，放在窗邊。若有人讀到這裡，請知道：我們曾努力把彼此照亮。」'}}
function ResourceRow({id,icon:Icon,title,value,unit,toast,onExplain}){return <button type="button" className={'ledger-row '+id} onClick={()=>onExplain({title,text:resourceHelp[id==='comfort'?'comfort':'cleanWater']})}><Icon size={19}/><span>{title}</span><strong>{value}<small>{unit}</small></strong><i><b style={{width:(unit==='%'?value:Math.min(100,value*5))+'%'}}/></i>{(toast?.key===id||(id==='water'&&toast?.key==='cleanWater'))&&<em className="resource-toast">+{toast.amount}{unit==='%'?'%':' 份'}</em>}</button>;}
function StatusRow({icon,title,value,detail,toast,id,onExplain,tutorialActive=false}){return <button type="button" data-tutorial-target={id==='power'?'power-check':id==='water'?'water-check':undefined} className={'system-status-row '+(id==='power'?'tutorial-power-row':id==='water'?'tutorial-water-row':'')} onClick={()=>{if(!tutorialActive)onExplain({title,text:resourceHelp[id==='comfort'?'comfort':id]});}}><span>{icon}</span><div><strong>{title}</strong><small>{detail}</small></div><b className={value>=65?'stable':'unstable'}>{value>=65?'穩定':'需留意'}・{value}%</b>{toast?.key===id&&<em className="resource-toast">+{toast.amount}%</em>}</button>;}
