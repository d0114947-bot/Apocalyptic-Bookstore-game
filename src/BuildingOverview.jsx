import { useState } from 'react';
import { ArrowLeft, ArrowUpRight, Building2, LockKeyhole } from 'lucide-react';

const difficultyNames={easy:'童話與溫拿鐵',normal:'求生手冊與黑美式',hard:'殘破史詩與無糖配方',nightmare:'燃盡秩序'};
const asset=file=>import.meta.env.BASE_URL+'assets/'+file;

export const ROOMS = [
  { id:'roof',level:'RF',name:'屋頂露臺',english:'ROOF TERRACE',icon:'🌱',status:'種植蔬果・雨水過濾',image:asset('roof-terrace.webp'),hotspot:'roof' },
  { id:'reading',level:'2F',name:'二樓閱覽室',english:'READING ROOM',icon:'🛋️',status:'留宿客人・安靜閱讀',image:asset('reading-room.webp'),hotspot:'reading' },
  { id:'store',level:'1F',name:'一樓咖啡書店',english:'BOOK & COFFEE',icon:'☕',status:'白天接待・倖存者交易',image:asset('book-cafe.webp'),hotspot:'cafe' },
  { id:'storage',level:'1F',name:'一樓倉儲室',english:'STORAGE',icon:'📦',status:'物資・館藏清單',image:asset('storage-room.webp'),hotspot:'storage' },
  { id:'machine',level:'B1',name:'地下機房',english:'MEP ROOM',icon:'⚙️',status:'發電・給水穩定度',image:asset('machine-room.webp'),hotspot:'machine' },
  { id:'manager',level:'B1',name:'店長休息室',english:'MANAGER ROOM',icon:'🛏️',status:'舒適度・手札・休息',image:asset('manager-room.webp'),hotspot:'manager' },
];

export default function BuildingOverview({selectedRoom,onSelectRoom,phase,difficulty='easy',musicMuted=false,onToggleMusic=()=>{},onRadio=()=>{},incomingCount=0,onCloseDay,pets=[],weather={},manuscript=0,progressOpen,onToggleProgress,unfinishedTasks=[],characterImage,onOpenJournal,journalText,children}) {
  const [shopkeeperOffset,setShopkeeperOffset]=useState({x:0,y:0}),[shopkeeperDrag,setShopkeeperDrag]=useState(null);
  const nightImages={roof:asset('屋頂露臺-晚上.webp'),reading:asset('二樓閱覽室-晚上.webp'),store:asset('一樓咖啡書店-晚上.webp')};
  const roomImage=phase==='night'?(nightImages[selectedRoom?.id]||selectedRoom?.image):selectedRoom?.image;
  if(selectedRoom) return <section className="full-room-scene" style={{'--room-photo':'url("'+roomImage+'")'}}>
    <div className="room-scene-shade"/>
    <button className="scene-back" onClick={()=>onSelectRoom(null)}><ArrowLeft size={17}/> 回到書店全景</button>
    <div className="scene-topline"><span>{selectedRoom.level} / {selectedRoom.english}</span><span>{weather.season}・{weather.sky}・{phase==='day'?'白天':'夜晚'}</span></div>
    <div className="scene-title"><span>{selectedRoom.icon}</span><div><h2>{selectedRoom.name}</h2><p>{selectedRoom.status}</p></div></div>
    {selectedRoom.id==='store'&&phase==='night'&&<div className="closed-sign"><LockKeyhole size={16}/> 已打烊，白天再接待客人。</div>}
    {selectedRoom.id==='store'&&phase==='day'&&!incomingCount&&<div className="room-hint">咖啡書店目前很安靜。</div>}
    {selectedRoom.id==='store'&&<button className="scene-radio" onClick={onRadio} aria-label="收聽收音機消息"><img src={asset('收音機.webp')} alt="收音機"/><span>收音機</span></button>}
    {selectedRoom.id==='manager'&&characterImage&&<button className="manager-sprite" onClick={onOpenJournal} aria-label="翻閱今日手札"><img src={characterImage} alt="店長"/><span>今日手札・第 {weather.day||1} 天<br/>{journalText||'今天也要守住書店。'}<small>點擊翻閱完整手記</small></span></button>}
    {children}
  </section>;
  return <section className="bim-overview" aria-label="書店全景導覽">
    <div className="overview-topline">
      <div className="overview-day-stack">
        <div className="overview-guest-count"><b>{phase==='day'?(incomingCount?'今日來客':'白天營業中'):'夜間休息'}</b><span>{phase==='day'?(incomingCount?`${incomingCount} 位倖存者`:'尚未有來客'):'店門已關閉'}</span>{phase==='day'&&incomingCount>0&&<button onClick={()=>onSelectRoom(ROOMS.find(room=>room.id==='store'))}>咖啡書店 <ArrowUpRight size={15}/></button>}</div>
        <div className="marquee task-marquee"><span>{unfinishedTasks.length?`待辦提示：${unfinishedTasks.join('　・　')}`:'目前沒有待處理事項，留意天氣與物資變化。'}</span></div>
      </div>
      <button className="overview-night-action" onClick={()=>phase==='night'?onSelectRoom(ROOMS.find(room=>room.id==='manager')):onCloseDay()} disabled={phase==='day'&&incomingCount>0}>{phase==='night'?<>回房<br/>休息</>:'進入夜晚'} <span>{phase==='night'?'☾':'→'}</span></button>
      <div className="overview-conditions"><span className="overview-caption">書店全景</span><strong>{weather.season||'春季'}　{weather.sky||'晴天'}</strong><span>{phase==='day'?'白天':'夜晚'}　·　第 {weather.day||1} 天</span></div>
      <div className="progress-control"><div className="overview-tools"><button aria-label="顯示手稿撰寫進度" title="手稿撰寫進度" onClick={onToggleProgress}>✒</button><span className="overview-difficulty">遊戲難度・{difficultyNames[difficulty]||difficultyNames.easy}</span><button className="overview-music-toggle" aria-label={musicMuted?'繼續播放音樂':'靜音音樂'} title={musicMuted?'繼續播放音樂':'靜音音樂'} aria-pressed={musicMuted} onClick={onToggleMusic}>{musicMuted?'♫̸':'♫'}</button></div>{progressOpen&&<div className="manuscript-meter"><span>手稿撰寫進度</span><strong>{manuscript}%</strong><i><b style={{width:manuscript+'%'}}/></i><small>{manuscript>=100?'結局已完成':'100% +10%　・　90% +8%　・　80% +5%　・　70% +3%　・　60% +1%（每晚，依最低資源計算）'}</small></div>}</div>
    </div>
    <div className={'panorama-frame '+(phase==='night'?'night-panorama':'')}><div className="panorama-art" style={{backgroundImage:`url("${asset(phase==='night'?'書店全景導覽-晚上.webp':'bookstore-overview.webp')}")`}}/>
      <div className="floor-marker marker-roof">RF <span>屋頂</span></div><div className="floor-marker marker-reading">2F <span>閱覽室</span></div><div className="floor-marker marker-first">1F <span>書店</span></div><div className="floor-marker marker-base">B1 <span>地下室</span></div>
      {characterImage&&<div className="panorama-shopkeeper" style={{transform:`translate(${shopkeeperOffset.x}px,${shopkeeperOffset.y}px)`}} onPointerDown={e=>{e.currentTarget.setPointerCapture(e.pointerId);setShopkeeperDrag({x:e.clientX,y:e.clientY,startX:shopkeeperOffset.x,startY:shopkeeperOffset.y});}} onPointerMove={e=>{if(shopkeeperDrag)setShopkeeperOffset({x:shopkeeperDrag.startX+e.clientX-shopkeeperDrag.x,y:shopkeeperDrag.startY+e.clientY-shopkeeperDrag.y});}} onPointerUp={()=>setShopkeeperDrag(null)}><img src={characterImage} alt="店長"/></div>}
      {ROOMS.map(room=><button key={room.id} className={'scan-room room-'+room.hotspot+' '+(room.id==='store'&&incomingCount>0&&phase==='day'?'room-arrival':'')} onClick={()=>onSelectRoom(room)} aria-label={'進入'+room.name}>
        <span className="scan-beam"/><span className="scan-label"><b>{room.icon} {room.name}</b><small>{room.status}</small></span>
        {!!pets.filter(pet=>pet.roomId===room.id).length&&<span className="panorama-pet-dots">{pets.filter(pet=>pet.roomId===room.id).map(p=><img key={p.id} src={p.image} alt={p.name}/>)}</span>}
      </button>)}
      <span className="panorama-measure">BOOKSTORE SHELTER · SPATIAL VIEW</span>
    </div>
    <div className="overview-footer"><span><Building2 size={14}/> BOOKSTORE / SIX SPACES</span><span>點擊發光空間進入房間</span><span>查看房間照片 <ArrowUpRight size={13}/></span></div>
  </section>;
}
