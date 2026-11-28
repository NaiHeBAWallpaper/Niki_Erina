let canvas, textbox, gl, shader, batcher, assetManager, skeletonRenderer;
let mvp = new spine.Matrix4();

let lastFrameTime;
let initialLoadTimer;
let modelFrame;
let renderFrame;
let renderTimer;
let loadingResolution;
let spineData;

let customScale = 1;
let positionX = 0;
let positionY = 0;
let targetFps = 60;
let bgmfile = './assets/audio/Theme_372.ogg';
let bgmvolume = 0;
let bgm;
let bufferColor = [0.3, 0.3, 0.3];

let introAnimation, acceptingClick;
let dialogBox = false;
let currentVoiceline = 1;
let mouseSelect = -1;
let trackerID = -1;
let untrackerID = -1;
let EPointX, EPointY;
let TPoint, TEye;
let headpatOrigin;
let headpatCooldown = 0;
const headpatTarget = new spine.Vector2();
const headpatOffset = new spine.Vector2();
let flipped = false;

let transpose = 1;
let renderScale = 1;

const MIN_RENDER_SCALE = 1.5;
const MAX_RENDER_SCALE = 2;
const MAX_RENDER_PIXELS = 5120 * 2880;

let currentTracks = []; // 跟踪当前播放的音频
let interfaceLanguage = 'default';
let steamLanguage = '';
let subtitleLanguagePreference = 'auto';
window.selectedLanguage = 'English';
const subtitleLocales = {
	English: 'en',
	Chinese: 'zh-Hans',
	TraditionalChinese: 'zh-Hant',
	Japanese: 'ja',
	Korean: 'ko',
	Thai: 'th'
};
let isVoicelinePlaying = false;

const CHARACTER = 'CH0321';
let modelResolution = '8k';
const HAS_A = { eye: false, point: true };

// Subtitles follow the Talk events in each Spine animation.

const AUDIO_DETAIL = [
    {
        dialog: {
            Japanese: [
                "へへっ、綺麗ですよね？ゲホゲホ。",
                "雪の結晶をポリビニルアセタールで固めたものです。",
                "時間が経ったとしても、温かい場所でも溶けません。"
            ],
            English: [
                "Hehe, it's pretty, right? *cough cough*",
                "It's a snowflake preserved in polyvinyl acetal.",
                "Even as time passes, or if it's in a warm place, it won't melt."
            ],
            Chinese: [
                "嘿嘿，很漂亮吧？咳咳。",
                "这是用聚乙烯醇缩缩醛固化保存的雪花晶体。",
                "就算时间流逝，或者放在温暖的地方，它也不会融化。"
            ],
            TraditionalChinese: [
                "嘿嘿，很漂亮吧？咳咳。",
                "這是用聚乙烯醇縮縮醛固化儲存的雪花晶體。",
                "就算時間流逝，或者放在溫暖的地方，它也不會融化。"
            ],
            Korean: [
                "헤헤, 예쁘죠? 콜록콜록.",
                "폴리비닐 아세탈으로 보존된 눈꽃입니다.",
                "시간이 지날수록, 혹은 따뜻한 곳에 있더라도 녹지 않습니다."
            ],
            Thai: ["แหะ ๆ สวยใช่ไหมคะ? แค่ก ๆ","นี่คือผลึกหิมะที่เก็บรักษาไว้ด้วยพอลิไวนิลอะซีทัลค่ะ","ต่อให้เวลาผ่านไป หรือเอาไปไว้ในที่อุ่น ๆ ก็ไม่ละลายค่ะ"]
        }
    },
    {
        dialog: {
            Japanese: [
                "せっかくなので一番大きくて綺麗なものを探そうとしたら……こんな時間になってしまって。",
                "ズビズビ……せっかくなので、永久に光る雪結晶にしてみました。",
                "どうでしょう？これを見るたびに、私のことを思い出してくれますか？"
            ],
            English: [
                "I wanted to find the biggest and prettiest one since I was at it... and before I knew it, it got this late.",
                "*sniffle*... So I turned it into a snowflake crystal that glows eternally.",
                "What do you think? Will you think of me every time you look at this?"
            ],
            Chinese: [
                "难得要找，我就想找个最大最漂亮的……结果不知不觉就到了这个时间。",
                "吸吸鼻涕……难得做一次，我就把它做成了能永久发光的雪花晶体。",
                "怎么样？以后每次看到它，您都会想起我吗？"
            ],
            TraditionalChinese: [
                "難得要找，我就想找個最大最漂亮的……結果不知不覺就到了這個時間。",
                "吸吸鼻涕……難得做一次，我就把它做成了能永久發光的雪花晶體。",
                "怎麼樣？以後每次看到它，您都會想起我嗎？"
            ],
            Korean: [
                "제가 가장 크고 아름다운 걸 찾고 싶었어요. 그리고 제가 생각하기 전에 이렇게 늦었습니다.",
                "그래서 나는 그것을 영원히 빛나는 눈꽃 결정으로 바꾸어 놓았다.",
                "이걸 볼 때마다 날 떠올릴 거야?"
            ],
            Thai: ["ไหน ๆ ก็ลองหาอันที่ใหญ่และสวยที่สุดดูแล้ว... รู้ตัวอีกทีก็ดึกป่านนี้ซะแล้วค่ะ","ฟืด ๆ... ไหน ๆ ก็ทำแล้ว เลยลองทำเป็นผลึกหิมะที่ส่องแสงได้ตลอดไปค่ะ","เป็นยังไงคะ? ทุกครั้งที่เห็นสิ่งนี้ คุณครูจะนึกถึงฉันไหมคะ?"]
        }
    },
    {
        dialog: {
            Japanese: [
                "ふふっ！やったぁ！喜んでもらえてよかったです。",
                "すごいですよね……これも、あれも、ぜーんぶ化学なんです。",
                "先生と、私も……化学で説明できるわけです。"
            ],
            English: [
                "Fufu! Yay! I'm so glad you like it.",
                "Isn't it amazing...? This, that, all of it is chemistry.",
                "Even you and I, Sensei... can be explained through chemistry."
            ],
            Chinese: [
                "呵呵！太好啦！您能喜欢真是太好了。",
                "很厉害吧……这个也是，那个也是，全都——是化学哦。",
                "老师和我也……同样可以用化学来解释呢。"
            ],
            TraditionalChinese: [
                "呵呵！太好啦！您能喜歡真是太好了。",
                "很厲害吧……這個也是，那個也是，全都——是化學哦。",
                "老師和我也……同樣可以用化學來解釋呢。"
            ],
            Korean: [
                "젠장, 너무 좋아서 반가워",
                "놀랍지 않나요? 이 모든 것은 화학입니다.",
                "심지어 너와 나, 선생님도 화학을 통해 설명할 수 있습니다."
            ],
            Thai: ["ฮึฮึ! เย้! ดีใจจังที่คุณครูชอบค่ะ","น่าทึ่งใช่ไหมคะ...? ทั้งนี่และนั่น ทั้งหมดก็คือเคมีเลยค่ะ","แม้แต่คุณครูกับฉัน... ก็อธิบายได้ด้วยเคมีเหมือนกันค่ะ"]
        }
    },
    {
        dialog: {
            Japanese: [
                "見えているものも、情報処理も、電気信号でしかありません。なのに反応しあうんです。",
                "どれもただの電気信号でしかないのに、感情なんて名前が付いてしまいました。",
                "いえ、それが嫌というわけではなく……。"
            ],
            English: [
                "What we see, how we process information—it's all just electrical signals. Yet, they react with each other.",
                "Even though it's all nothing more than electrical signals, we ended up giving it a name like 'emotions'.",
                "No, it's not that I dislike it or anything..."
            ],
            Chinese: [
                "亲眼所见的事物也好，信息的处理也罢，归根结底都只是电气信号而已。可它们却会产生相互反应。",
                "明明全都只是些电气信号，却偏偏被赋予了‘感情’这样的名字。",
                "不，我并不是讨厌这样啦……"
            ],
            TraditionalChinese: [
                "親眼所見的事物也好，資訊的處理也罷，歸根結底都只是電氣訊號而已。可它們卻會產生相互反應。",
                "明明全都只是些電氣訊號，卻偏偏被賦予了‘感情’這樣的名字。",
                "不，我並不是討厭這樣啦……"
            ],
            Korean: [
                "우리가 보는 것, 우리가 정보를 처리하는 방식은 모두 전기 신호입니다. 그럼에도 불구하고, 그들은 서로 반응합니다.",
                "비록 이 모든 것이 전기적 신호일 뿐이지만 결국에는 '감각'이라는 이름을 붙였습니다.",
                "아니, 내가 싫어하는건 아니지..."
            ],
            Thai: ["ทั้งสิ่งที่มองเห็นและการประมวลผลข้อมูล ล้วนเป็นแค่สัญญาณไฟฟ้า แต่กลับเกิดปฏิกิริยาต่อกันได้","ทั้งที่ทั้งหมดเป็นแค่สัญญาณไฟฟ้าแท้ ๆ แต่เราก็ตั้งชื่อให้มันว่า ‘ความรู้สึก’ ไปซะแล้วค่ะ","เปล่านะคะ ฉันไม่ได้ไม่ชอบเรื่องนั้นหรอก..."]
        }
    },
    {
        dialog: {
            Japanese: [
                "こんな風に反応が起こるなら、同じがいいな、と思って。",
                "なーんて！ゲホゲホ！私、風邪でおかしくなっちゃったのかもしれません！",
                "あははっ……！ははっ……。"
            ],
            English: [
                "I just thought... if a reaction like this is going to happen, I'd want us to feel the same way.",
                "Just kidding! *cough cough* Maybe the cold is getting to my head!",
                "Ahaha...! Haha..."
            ],
            Chinese: [
                "既然会产生这样的反应，我就想着……要是我们能产生相同的反应就好了。",
                "开——玩笑的！咳咳！我一定是感冒发烧把脑子烧坏了！",
                "阿哈哈……！哈哈……"
            ],
            TraditionalChinese: [
                "既然會產生這樣的反應，我就想著……要是我們能產生相同的反應就好了。",
                "開——玩笑的！咳咳！我一定是感冒發燒把腦子燒壞了！",
                "阿哈哈……！哈哈……"
            ],
            Korean: [
                "그냥 생각했어요. 이런 반응이 일어나면, 우리도 같은 느낌을 받으면 좋겠어요.",
                "농담이야! *침침침* 어쩌면 감기가 내 머리에 닿을 수도 있어!",
                "아하!"
            ],
            Thai: ["ฉันแค่คิดว่า ถ้าจะเกิดปฏิกิริยาแบบนี้ขึ้น ก็อยากให้เรารู้สึกเหมือนกันค่ะ","ล้อเล่นน่า! แค่ก ๆ! สงสัยจะเป็นหวัดจนเพี้ยนไปแล้วมั้งคะ!","อาฮะฮะ...! ฮะฮะ..."]
        }
    }
];


const HITBOX = {
	headpat: { xMin: 1960, xMax: 2200, yMin: 200, yMax: 640, start: 'Pat_01_M', end: 'PatEnd_01_M' },
	facepat: { xMin: 1565, xMax: 1955, yMin: 300, yMax: 745, start: 'Pat2_01_M', end: 'PatEnd2_01_M' },
	voiceline: { xMin: 700, xMax: 1500, yMin: 480, yMax: 1100 }
};

const INTRO_TIMEOUT = 19500;
const HEADPAT_CLAMP = 30;
const HEADPAT_DRAG_SCALE = 0.35;
const HEADPAT_FOLLOW_TIME = 0.055;
const HEADPAT_RETURN_TIME = 0.08;
const EYE_CLAMP_X = 200;
const EYE_CLAMP_Y = EYE_CLAMP_X * (9 / 16);
const EYE_STEP = 10;
const FX_ALPHA = 0.4; // FX_01 特效透明度（0~1，越小越暗），用于降低过亮光效

let mousePos = { x: 0, y: 0 };
let volume = 0.5;
let mouseOptions = { voicelines: true, headpatting: true, mousetracking: true, drawHitboxes: false };

// Helper clamp function. Math does not appear to have clamp() in this version.
function clamp(num, min, max) {
	return Math.min(Math.max(num, min), max);
}

function getRenderScale(cssWidth = window.innerWidth, cssHeight = window.innerHeight) {
	const desiredScale = Math.max(window.devicePixelRatio || 1, MIN_RENDER_SCALE);
	const pixelBudgetScale = Math.sqrt(MAX_RENDER_PIXELS / Math.max(1, cssWidth * cssHeight));
	return Math.max(1, Math.min(desiredScale, MAX_RENDER_SCALE, pixelBudgetScale));
}

function syncCanvasSize(element, cssWidth, cssHeight, scale) {
	element.style.width = cssWidth + 'px';
	element.style.height = cssHeight + 'px';
	element.width = Math.max(1, Math.round(cssWidth * scale));
	element.height = Math.max(1, Math.round(cssHeight * scale));
}

// NOTE: X and Y appears to be inversely related from cursor position to bone adjustment.
//       This behavior's reason is unknown, but it LOOKS right so leave it alone!
const EYE_ANGLE = 70 * Math.PI / 180;

function trackMouse() {
	let adjX = (mousePos.x / canvas.width) - 0.5;
	let adjY = (mousePos.y / canvas.height) - 0.5;

	const cos = Math.cos(EYE_ANGLE);
	const sin = Math.sin(EYE_ANGLE);

	// 旋转后的坐标
	const rotX = adjX * cos + adjY * sin;
	const rotY = -adjX * sin + adjY * cos;

	TEye.y -= Math.sign(rotX) * EYE_STEP;
	TEye.x -= Math.sign(rotY) * EYE_STEP;

	TEye.y = clamp(
		TEye.y,
		EPointY - Math.abs(rotX) * EYE_CLAMP_X,
		EPointY + Math.abs(rotX) * EYE_CLAMP_X
	);

	TEye.x = clamp(
		TEye.x,
		EPointX - Math.abs(rotY) * EYE_CLAMP_Y,
		EPointX + Math.abs(rotY) * EYE_CLAMP_Y
	);
}

function untrackMouse() {
	if (Math.abs(TEye.y - EPointY) <= EYE_STEP && Math.abs(TEye.x - EPointX) <= EYE_STEP) {
		if (untrackerID != -1) {
			TEye.y = EPointY;
			TEye.x = EPointX;
			clearInterval(untrackerID);
			untrackerID = -1;
			setTimeout(function () {
				acceptingClick = true;
			}, 500);
		}
	}
	if (TEye.y > EPointY) TEye.y -= EYE_STEP;
	if (TEye.y < EPointY) TEye.y += EYE_STEP;
	if (TEye.x > EPointX) TEye.x -= EYE_STEP;
	if (TEye.x < EPointX) TEye.x += EYE_STEP;
}

function applyHeadpat(delta) {
	const dx = headpatTarget.x - headpatOffset.x;
	const dy = headpatTarget.y - headpatOffset.y;
	if (Math.abs(dx) < 0.01 && Math.abs(dy) < 0.01) {
		headpatOffset.set(headpatTarget.x, headpatTarget.y);
	} else {
		const blend = 1 - Math.exp(-delta / (headpatOrigin ? HEADPAT_FOLLOW_TIME : HEADPAT_RETURN_TIME));
		headpatOffset.x += dx * blend;
		headpatOffset.y += dy * blend;
	}
	TPoint.x += headpatOffset.x;
	TPoint.y += headpatOffset.y;
}

function releaseHeadpatOnExit() {
	if (headpatOrigin && spineData) releasedMouse();
}

function playVoiceline() {
	const state = spineData.state;
	const animationName = `Talk_0${currentVoiceline}`;
	const { dialog } = AUDIO_DETAIL[currentVoiceline - 1];
	const motion = state.setAnimation(1, `${animationName}_M`, false);
	const expression = state.setAnimation(2, `${animationName}_A`, false);
	state.addEmptyAnimation(1, 0.5, motion.animationEnd);
	state.addEmptyAnimation(2, 0.5, expression.animationEnd);

	const cues = motion.animation.timelines
		.flatMap(timeline => timeline.events || [])
		.filter(event => event.data.name === 'Talk');
	const clips = new Map(cues.map((event, index) => {
		const filename = CHARACTER + event.stringValue.slice(CHARACTER.length).toLowerCase();
		const track = new Audio(`./assets/audio/${filename}.ogg`);
		track.preload = 'auto';
		track.volume = volume;
		return [event, { track, dialog, index }];
	}));

	isVoicelinePlaying = true;
	motion.listener = {
		event: (_entry, event) => {
			const clip = clips.get(event);
			if (!clip) return;
			const { track, index } = clip;
			currentTracks.push(clip);
			const finish = () => {
				if (!currentTracks.includes(clip)) return;
				currentTracks = currentTracks.filter(active => active !== clip);
				if (!currentTracks.length) textbox.style.opacity = 0;
			};
			track.addEventListener('ended', finish, { once: true });
			track.play().catch(finish);

			if (dialogBox) {
				textbox.textContent = getSubtitleText(dialog, window.selectedLanguage, index);
				textbox.style.opacity = 1;
			}
		},
		complete: () => {
			isVoicelinePlaying = false;
			acceptingClick = true;
			currentVoiceline = currentVoiceline % AUDIO_DETAIL.length + 1;
		}
	};
}

// Hitbox Scaling
function t(n, side) {
	let d = { x: { length: 2560, mid: (canvas.width / 2) }, y: { length: 1600, mid: (canvas.height / 2) } }
	n = d[side].mid - n;
	n = (d[side].length / (transpose * 2)) - n;
	n = (n - (d[side].length / (transpose * 2))) / customScale;
	return (n + (d[side].length / (transpose * 2))) * transpose;
}

// -1 = [No Entry], 1 = Headpat, 2 = Voiceline, 3 = Eye Track
function pressedMouse(x, y) {
	const tx = t(x, 'x');
	const ty = t(y, 'y');
	const pat = [HITBOX.facepat, HITBOX.headpat].find(box => tx >= box.xMin && tx < box.xMax && ty >= box.yMin && ty < box.yMax);
	if (pat && mouseOptions.headpatting) {
		spineData.state.setAnimation(1, pat.start, false);
		headpatOrigin = { x, y, endAnimation: pat.end };
		mouseSelect = 1;
	}
	else if (tx > HITBOX.voiceline.xMin && tx < HITBOX.voiceline.xMax && ty > HITBOX.voiceline.yMin && ty < HITBOX.voiceline.yMax && mouseOptions.voicelines) {
		mouseSelect = 2;
	}
	else if (mouseOptions.mousetracking) {
		if (trackerID == -1) {
			trackerID = setInterval(trackMouse, 20);
		}
		spineData.state.setEmptyAnimation(1, 0);
		spineData.state.setEmptyAnimation(2, 0);
		let eyetracking = spineData.state.addAnimation(1, 'Look_01_M', false, 0);
		eyetracking.mixDuration = 0.2;
		if (HAS_A.eye) {
			let eyetracking2 = spineData.state.addAnimation(2, 'Look_01_A', false, 0);
			eyetracking2.mixDuration = 0.2;
		}
		mousePos.x = x;
		mousePos.y = y;
		mouseSelect = 3;
	}
	else {
		// Mouse tracking is disabled and click is not in any specific area
		// Set mouseSelect to -1 to indicate no interaction, this prevents
		// releasedMouse from triggering any animation on mouseup
		mouseSelect = -1;
		acceptingClick = true;
	}
}

function drawHitboxes() {
	if (!overlay || !overlay.getContext) return;
	const ctx = overlay.getContext('2d');
	if (!ctx) return;

	ctx.clearRect(0, 0, overlay.width, overlay.height);
	if (!mouseOptions.drawHitboxes) return;

	
	ctx.save();
	ctx.lineWidth = 2 * renderScale;
	ctx.strokeStyle = 'red';
	ctx.globalAlpha = 0.5;

	function worldToScreen(n, side) {
		let d = { x: { length: 2560, mid: (canvas.width / 2) }, y: { length: 1600, mid: (canvas.height / 2) } };
		n = (n / transpose) - (d[side].length / (transpose * 2));
		n = n * customScale + (d[side].length / (transpose * 2));
		n = (d[side].length / (transpose * 2)) - n;
		const offset = side === 'x' ? canvas.width * positionX : canvas.height * positionY;
		return d[side].mid - n + offset;
	}

	for (const key in HITBOX) {
		const box = HITBOX[key];
		const x1 = worldToScreen(box.xMin, 'x');
		const y1 = worldToScreen(box.yMin, 'y');
		const x2 = worldToScreen(box.xMax, 'x');
		const y2 = worldToScreen(box.yMax, 'y');
		const width = x2 - x1;
		const height = y1 - y2;
		ctx.strokeRect(x1, y2, width, height);
	}

	ctx.restore();
}

function movedMouse(x, y) {
	switch (mouseSelect) {
		case 1: {
			const scale = HEADPAT_DRAG_SCALE * transpose / customScale;
			const parent = TPoint.parent;
			headpatTarget.set(
				parent.worldX + (x - headpatOrigin.x) * scale,
				parent.worldY + (headpatOrigin.y - y) * scale
			);
			parent.worldToLocal(headpatTarget);
			const distance = headpatTarget.length();
			if (distance > HEADPAT_CLAMP) {
				headpatTarget.x *= HEADPAT_CLAMP / distance;
				headpatTarget.y *= HEADPAT_CLAMP / distance;
			}
			break;
		}
		case 2:
			mouseSelect = -1;
			acceptingClick = true;
			break;
		case 3:
			mousePos.x = x;
			mousePos.y = y;
			break;
		default:
	}
}

function releasedMouse() {
	switch (mouseSelect) {
		case 1: {
			const { endAnimation } = headpatOrigin;
			headpatOrigin = null;
			headpatTarget.set(0, 0);
			const state = spineData.state;
			const motion = state.setAnimation(1, endAnimation, false);
			state.addEmptyAnimation(1, 0.5, motion.animationEnd);
			state.addEmptyAnimation(2, 0.5, 0);
			headpatCooldown = setTimeout(() => {
				headpatCooldown = 0;
				acceptingClick = true;
			}, 500);
			break;
		}
		case 2:
			playVoiceline();
			break;
		case 3:
			if (trackerID != -1) {
				clearInterval(trackerID);
				trackerID = -1;
			}
			if (untrackerID == -1) {
				untrackerID = setInterval(untrackMouse, 20);
			}
			let eyetracking = spineData.state.setAnimation(1, 'LookEnd_01_M', false);
			// let eyetracking2 = spineData.state.setAnimation(2, 'LookEnd_01_A', false);
			eyetracking.mixDuration = 0;
			eyetracking2.mixDuration = 0;
			spineData.state.addEmptyAnimation(1, 0.5, 0);
			spineData.state.addEmptyAnimation(2, 0.5, 0);
			break;
		default:
	}
	mouseSelect = -1;
}

// adjusts mouse values for flipped canvas
function setMouse(event) {
	const rect = canvas.getBoundingClientRect();
	let ax = (event.clientX - rect.left) * renderScale;
	let ay = (event.clientY - rect.top) * renderScale;
	if (flipped) {
		ax = canvas.width - ax;
	}

	return { x: ax - canvas.width * positionX, y: ay - canvas.height * positionY };
}

function getSubtitleText(dialog, language, index) {
	let text = dialog?.[language]?.[index];
	if (text == null && language === 'Thai') {
		language = 'English';
		text = dialog?.[language]?.[index];
	}
	textbox.lang = subtitleLocales[language];
	return text ?? "";
}

function updateSubtitleLanguage() {
	let language = subtitleLanguagePreference;
	if (language === 'auto') {
		const locale = interfaceLanguage === 'default' ? steamLanguage : interfaceLanguage;
		const [primary, region] = locale.split(/[-_]/);
		if (primary === 'tchinese' || (primary === 'zh' && ['cht', 'hant', 'tw', 'hk', 'mo'].includes(region))) {
			language = 'TraditionalChinese';
		} else if (primary === 'schinese' || primary === 'zh') {
			language = 'Chinese';
		} else if (primary === 'ja' || primary === 'japanese') {
			language = 'Japanese';
		} else if (primary === 'ko' || primary === 'korean' || primary === 'koreana') {
			language = 'Korean';
		} else if (primary === 'th' || primary === 'thai') {
			language = 'Thai';
		} else {
			language = 'English';
		}
	}

	if (language === window.selectedLanguage) return;
	window.selectedLanguage = language;
	textbox.lang = subtitleLocales[language];
	const clip = currentTracks.at(-1);
	if (dialogBox && clip) textbox.textContent = getSubtitleText(clip.dialog, language, clip.index);
}

function init() {
	// Wallpaper Engine settings
	window.wallpaperPropertyListener = {
		applyGeneralProperties: (props) => {
			const language = props.language?.value ?? props.language;
			const steamLocale = props.steamlanguage?.value ?? props.steamlanguage;
			if (typeof language !== 'string' && typeof steamLocale !== 'string') return;
			if (typeof language === 'string') interfaceLanguage = language.toLowerCase();
			if (typeof steamLocale === 'string') steamLanguage = steamLocale.toLowerCase();
			updateSubtitleLanguage();
		},
		applyUserProperties: (props) => {
			if (props.schemecolor) {
				bufferColor = props.schemecolor.value.split(" ");
			}
			if (props.alignmentfliph) flipped = props.alignmentfliph.value;
			if (props.scale) {
				customScale = props.scale.value;
				document.documentElement.style.setProperty('--wallpaper-scale', customScale);
			}
			if (props.positionx) {
				positionX = props.positionx.value / 100;
				document.documentElement.style.setProperty('--wallpaper-position-x', props.positionx.value + 'vw');
			}
			if (props.positiony) {
				positionY = props.positiony.value / 100;
				document.documentElement.style.setProperty('--wallpaper-position-y', props.positiony.value + 'vh');
			}
			if (props.scale || props.positionx || props.positiony) resize();
			if (props.targetfps) targetFps = props.targetfps.value;

			if (props.introanimation) introAnimation = props.introanimation.value;

			if (props.mousetracking) {
				const wasEnabled = mouseOptions.mousetracking;
				mouseOptions.mousetracking = props.mousetracking.value;

				if (wasEnabled && !mouseOptions.mousetracking) {
					if (trackerID != -1) {
						clearInterval(trackerID);
						trackerID = -1;
					}
					if (untrackerID != -1) {
						clearInterval(untrackerID);
						untrackerID = -1;
					}
					if (spineData && mouseSelect === 3) {
						spineData.state.setEmptyAnimation(1, 0);
						spineData.state.setEmptyAnimation(2, 0);
						mouseSelect = -1;
					}
				}
			}
			if (props.headpatting) mouseOptions.headpatting = props.headpatting.value;
			if (props.voicelines) mouseOptions.voicelines = props.voicelines.value;
			if (props.voicevolume) volume = props.voicevolume.value / 100;
			if (props.showdialog) dialogBox = props.showdialog.value;
			if (props.dialogx) {
				textbox.style.left = 'unset';
				textbox.style.right = (100 - props.dialogx.value) + '%';
			}
			if (props.dialogy) textbox.style.top = props.dialogy.value + '%';
			if (props.drawHitboxes) mouseOptions.drawHitboxes = props.drawHitboxes.value;
			if (props.lensflare) {
				glareEnabled = props.lensflare.value;
				if (spineData) applyGlareOpacity(spineData.skeleton.data);
			}

			// 监听模型分辨率设置
			if (props.modelresolution) modelResolution = props.modelresolution.value;
			if (assetManager && typeof introAnimation !== 'undefined' && !modelFrame &&
				(props.modelresolution || loadingResolution !== modelResolution)) {
				reloadModel();
			}

			if (props.dialoglanguage) {
				const language = props.dialoglanguage.value;
				subtitleLanguagePreference = Object.hasOwn(subtitleLocales, language) ? language : 'auto';
				updateSubtitleLanguage();
			}

			if (props.bgmfile) {
				bgmfile = 'file:///' + props.bgmfile.value.replace("%3A", "\:");
			}
			if (props.bgmvolume) {
				bgmvolume = props.bgmvolume.value / 100;
				if (bgm) bgm.volume = bgmvolume;
			}
		},
		setPaused: function(isPaused) {
				if (bgm) {
					if (isPaused) {
						setTimeout(() => { bgm.volume = 0; }, 200);
					} else {
						setTimeout(() => { bgm.volume = bgmvolume; }, 200);
					}
				}
			}
	};

	textbox = document.getElementById('textbox');
	textbox.lang = subtitleLocales[window.selectedLanguage];

	canvas = document.getElementById('canvas');
	canvas.addEventListener('mouseleave', releaseHeadpatOnExit);
	window.addEventListener('blur', releaseHeadpatOnExit);

	overlay = document.getElementById('overlay');
	renderScale = getRenderScale();
	syncCanvasSize(canvas, window.innerWidth, window.innerHeight, renderScale);
	syncCanvasSize(overlay, window.innerWidth, window.innerHeight, renderScale);

	let config = { alpha: false, premultipliedAlpha: false, antialias: true, powerPreference: 'high-performance' };
	gl = canvas.getContext('webgl', config) || canvas.getContext('experimental-webgl', config);
	if (!gl) {
		alert('WebGL is unavailable.');
		return;
	}

	// Create a simple shader, mesh, model-view-projection matrix, SkeletonRenderer, and AssetManager.
	shader = spine.Shader.newTwoColoredTextured(gl);
	batcher = new spine.PolygonBatcher(gl);
	mvp.ortho2d(0, 0, canvas.width - 1, canvas.height - 1);
	skeletonRenderer = new spine.SkeletonRenderer(gl);
	assetManager = new spine.AssetManager(gl);

	window.addEventListener('resize', resize);
	initialLoadTimer = setTimeout(() => {
		if (typeof introAnimation === 'undefined') introAnimation = true;
		if (loadingResolution === undefined && !modelFrame) reloadModel();
	}, 350);

	window.addEventListener('pagehide', event => {
		if (event.persisted) return;
		canvas.style.visibility = 'hidden';
		clearTimeout(initialLoadTimer);
		cancelAnimationFrame(modelFrame);
		cancelAnimationFrame(renderFrame);
		clearTimeout(renderTimer);
		gl.getExtension('WEBGL_lose_context')?.loseContext();
	});
}

let introAudioIsPlaying = false;
let introAudioTracks = [];
let introTimeouts = [];

// Function to reload the model with a new resolution
function reloadModel() {
	if (!assetManager || modelFrame) return;
	if (mouseSelect === 1 || headpatCooldown) {
		if (mouseSelect === 1) mouseSelect = -1;
		acceptingClick = false;
	}
	clearTimeout(headpatCooldown);
	headpatCooldown = 0;
	headpatOrigin = null;
	headpatTarget.set(0, 0);
	headpatOffset.set(0, 0);

	// Stop the current BGM if it's playing
	if (bgm) {
		bgm.pause();
		bgm = null;
	}
	

	// Stop all intro audio and clear related timeouts
	introAudioIsPlaying = false;
	
	// Stop and clear all intro audio tracks
	introAudioTracks.forEach(track => {
		if (track && !track.paused) {
			track.pause();
			track.currentTime = 0;
		}
	});
	introAudioTracks = [];
	
	// Stop and clear all voiceline audio tracks
	currentTracks.forEach(({ track }) => {
		if (track && !track.paused) {
			track.pause();
			track.currentTime = 0;
		}
	});
	currentTracks = [];
	
	// Clear all intro timeouts
	introTimeouts.forEach(timeout => clearTimeout(timeout));
	introTimeouts = [];
	
	isVoicelinePlaying = false;
	
	// Hide dialog box
	if (textbox) {
		textbox.style.opacity = 0;
	}
	
	canvas.style.visibility = 'hidden';
	cancelAnimationFrame(renderFrame);
	clearTimeout(renderTimer);
	spineData = null;
	assetManager.removeAll();
	loadingResolution = modelResolution;
	const binaryPath = new URL(`assets/${modelResolution}/${CHARACTER}_home.skel`, document.baseURI).href;
	const atlasPath = new URL(`assets/${modelResolution}/${CHARACTER}_home.atlas`, document.baseURI).href;
	assetManager.loadBinary(binaryPath);
	assetManager.loadTextureAtlas(atlasPath);
	function waitForAssets() {
		if (!assetManager.isLoadingComplete()) {
			modelFrame = requestAnimationFrame(waitForAssets);
			return;
		}
		modelFrame = 0;
		if (loadingResolution !== modelResolution) {
			reloadModel();
			return;
		}
		if (assetManager.get(binaryPath) && assetManager.get(atlasPath)) {
			load(binaryPath, atlasPath);
		} else {
			console.error('Model assets not found for resolution: ' + loadingResolution);
			loadingResolution = undefined;
		}
	}
	modelFrame = requestAnimationFrame(waitForAssets);
}

// CITATION: http://esotericsoftware.com/spine-api-reference#
// CITATION: http://en.esotericsoftware.com/forum/Spine-Unity-Making-the-arm-follow-the-mouse-7856
let modelMouseHandlersBound = false;

function interactionLoad() {
	// Touch_Point and Touch_Eye
	TPoint = spineData.skeleton.findBone('Touch_Point');
	TEye = spineData.skeleton.findBone('Touch_Eye');
	EPointX = TEye.x;
	EPointY = TEye.y;

	if (!modelMouseHandlersBound) {
		modelMouseHandlersBound = true;
		downaction = canvas.addEventListener('mousedown', function (event) {
			if (isVoicelinePlaying || !acceptingClick) {
				return;
			}
			acceptingClick = false;
			let mouseData = setMouse(event);
			pressedMouse(mouseData.x, mouseData.y);
		});
		upaction = canvas.addEventListener('mouseup', function () {
			// Only call releasedMouse if there was a valid mousedown interaction
			// (i.e., mouseSelect is not -1 or acceptingClick was set to false by pressedMouse)
			if (mouseSelect !== -1) {
				releasedMouse();
			} else {
				// Ensure acceptingClick is restored even if no interaction occurred
				if (!headpatCooldown) acceptingClick = true;
			}
		});
		moveaction = canvas.addEventListener('mousemove', function (event) {
			let mouseData = setMouse(event);
			movedMouse(mouseData.x, mouseData.y);
		});
	}

	if (!introAnimation) {
		acceptingClick = true;
	}
	else {
		setTimeout(function () {
			acceptingClick = true;
		}, INTRO_TIMEOUT);
	}

	return 1;
}

function load(dynamicBinaryPath, dynamicAtlasPath) {
	spineData = loadSpineData(dynamicBinaryPath, dynamicAtlasPath, false);

	adjustFxBrightness();

	// User Option to skip Intro Animation
	if (introAnimation) {
		spineData.state.addAnimation(0, 'Start_Idle_01', false);

		if (mouseOptions.voicelines) {
			let track = new Audio(`./assets/audio/${CHARACTER}_memoriallobby_0.ogg`);
			track.volume = volume;
			setTimeout(function () {
				track.play();
			}, 11500);
		}
	}

	spineData.state.addAnimation(0, 'Idle_01', true, 0);

	interactionLoad();
	resize();

	// Plays user-defined BGM (if set)
	if (!bgm) {
		bgm = new Audio(bgmfile);
		bgm.volume = bgmvolume;
		bgm.loop = true;
		bgm.play();
		bgm.addEventListener('ended', function () {
			this.currentTime = 0;
			this.play();
		}, false);
	}

	lastFrameTime = Date.now() / 1000;
	// Call render every frame.
	render();
	canvas.style.visibility = 'visible';
}

const GLARE_SLOTS = new Set([
	"BG_F_04", "FX_01"
]);
const GLARE_OPACITY = 0.4;
let glareEnabled = true;
const originalGlareOpacity = new WeakMap();

// Scale attachment opacity once so animated slot colors still control the light.
function applyGlareOpacity(skeletonData) {
	for (const skin of skeletonData.skins) {
		for (const { slotIndex, attachment } of skin.getAttachments()) {
			const slot = skeletonData.slots[slotIndex];
			if (!GLARE_SLOTS.has(slot.name) || slot.blendMode !== 1 || !attachment.color) continue;
			if (!originalGlareOpacity.has(attachment)) originalGlareOpacity.set(attachment, attachment.color.a);
			attachment.color.a = originalGlareOpacity.get(attachment) * (glareEnabled ? GLARE_OPACITY : 0);
		}
	}
}

function loadSpineData(binaryPath, atlasPath, premultipliedAlpha) {
	// Load the texture atlas from the AssetManager.
	let atlas = assetManager.get(atlasPath);

	// Create a AtlasAttachmentLoader that resolves region, mesh, boundingbox and path attachments
	let atlasLoader = new spine.AtlasAttachmentLoader(atlas);

	// Create a SkeletonBinary instance for parsing the .skel file.
	let skeletonBinary = new spine.SkeletonBinary(atlasLoader);

	// Set the scale to apply during parsing, parse the file, and create a new skeleton.
	skeletonBinary.scale = 1;
	let skeletonData = skeletonBinary.readSkeletonData(assetManager.get(binaryPath));
	applyGlareOpacity(skeletonData);
	let skeleton = new spine.Skeleton(skeletonData);
	let bounds = calculateSetupPoseBounds(skeleton);

	// Create an AnimationState, and set the initial animation in looping mode.
	let animationStateData = new spine.AnimationStateData(skeleton.data);
	animationStateData.defaultMix = 0.5;
	let animationState = new spine.AnimationState(animationStateData);

	// Pack everything up and return to caller.
	return { skeleton: skeleton, state: animationState, bounds: bounds, premultipliedAlpha: premultipliedAlpha };
}

function calculateSetupPoseBounds(skeleton) {
	skeleton.setToSetupPose();
	skeleton.updateWorldTransform(spine.Physics.update);
	let offset = new spine.Vector2();
	let size = new spine.Vector2();
	skeleton.getBounds(offset, size, []);
	return { offset: offset, size: size };
}





// 降低 FX_01 特效亮度：该槽位使用 Additive 混合模式，叠加过亮会冲淡后方骨骼。
function adjustFxBrightness() {
	if (!spineData || !spineData.skeleton) return;
	const fxSlot = spineData.skeleton.findSlot('FX_01');
	if (fxSlot) {
		fxSlot.color.a = FX_ALPHA;
		fxSlot.data.color.a = FX_ALPHA;
	}
}

function render() {
    let now = Date.now() / 1000;
    let delta = now - lastFrameTime;

    lastFrameTime = now;

    gl.clearColor(bufferColor[0], bufferColor[1], bufferColor[2], 1);
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Only render if spineData is available
    if (spineData) {
        // Apply the animation state based on the delta time.
        let skeleton = spineData.skeleton;
        let state = spineData.state;
        let premultipliedAlpha = spineData.premultipliedAlpha;
        state.update(delta);
		state.apply(skeleton);
		
        const pointX = TPoint.x;
        const pointY = TPoint.y;
        applyHeadpat(delta);
        skeleton.updateWorldTransform(spine.Physics.update);
        TPoint.x = pointX;
        TPoint.y = pointY;

        // Bind the shader and set the texture and model-view-projection matrix.
        shader.bind();
        // 修改这两行，从 spine.webgl.Shader 改为 spine.Shader
        shader.setUniformi(spine.Shader.SAMPLER, 0);
        shader.setUniform4x4f(spine.Shader.MVP_MATRIX, mvp.values);

        // Start the batch and tell the SkeletonRenderer to render the active skeleton.
        batcher.begin(shader);
        skeletonRenderer.premultipliedAlpha = premultipliedAlpha;
        skeletonRenderer.draw(batcher, skeleton);
        batcher.end();

        shader.unbind();
    }

    // throttle fps
	let elapsed = Date.now() / 1000 - now;
	let targetFrameTime = 1 / targetFps;
	let delay = Math.max(targetFrameTime - elapsed, 0) * 1000;

	drawHitboxes();

	renderTimer = setTimeout(() => {
		renderFrame = requestAnimationFrame(render);
	}, delay);
}

function resize() {
	let w = window.innerWidth;
	let h = window.innerHeight;
	renderScale = getRenderScale();
	syncCanvasSize(canvas, w, h, renderScale);
	syncCanvasSize(overlay, w, h, renderScale);

	// Set values to position skeleton to center of canvas.
	// Will always attempt to Fit to Fill while maintaining aspect ratio. As a result, a scale of [1] will mean different things across various device resolutions.
	let centerX = 0;
	let centerY = 900;
	let wr = canvas.width / 2560;
	let hr = canvas.height / 1600;
	let width = (2560 / customScale);
	let height = (1600 / customScale);

	if (wr < hr) {
		width = height * (canvas.width / canvas.height);

		transpose = 1600 / canvas.height;
	}
	else if (wr > hr) {
		height = width * (canvas.height / canvas.width);

		transpose = 2560 / canvas.width;
	}
	else {
		transpose = 1600 / canvas.height;
	}

	mvp.ortho2d(centerX - width / 2 - positionX * width, centerY - height / 2 + positionY * height, width, height);
	gl.viewport(0, 0, canvas.width, canvas.height);
}

init();
