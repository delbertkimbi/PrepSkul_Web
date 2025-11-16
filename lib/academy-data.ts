export type AcademyLevelId = 'nursery' | 'primary' | 'secondary' | 'university' | 'skills';

export interface QuizQuestion {
	question: string;
	options: string[];
	// IMPORTANT: Set the index of the correct answer here. Update content only; logic reads this field.
	correctAnswerIndex: number;
}

export interface AcademyModule {
	id: string;
	title: string;
	description: string;
	content: {
		// Replace with your real content. Supports simple HTML strings rendered safely.
		html: string;
		videoUrl?: string;
		videos?: Array<{ youtubeUrl: string; caption?: string }>;
	};
	quiz: QuizQuestion[];
    // Optional per-section breakdown for multi-page modules
    sections?: AcademySection[];
}

export interface AcademySection {
    id: string; // e.g. "1-1"
    title: string; // e.g. "1.1 Overview of the Cameroon Education System"
    html: string; // content for this section only
    youtubeUrl: string;
    caption?: string;
}

export interface AcademyLevel {
	id: AcademyLevelId;
	name: string;
	description: string;
	modules: AcademyModule[];
}

function makePlaceholderQuestions(seed: string): QuizQuestion[] {
	// Simple deterministic placeholders by seed length; replace with real questions.
	const base = seed.length % 3;
	return [
		{
			question: 'Which option best fits this module? (Replace with real question)',
			options: ['Option A', 'Option B', 'Option C', 'Option D'],
			correctAnswerIndex: (base + 1) % 4,
		},
		{
			question: 'Select the correct teaching principle. (Replace content)',
			options: ['Principle 1', 'Principle 2', 'Principle 3', 'Principle 4'],
			correctAnswerIndex: (base + 2) % 4,
		},
		{
			question: 'Pick the accurate classroom strategy. (Replace content)',
			options: ['Strategy A', 'Strategy B', 'Strategy C', 'Strategy D'],
			correctAnswerIndex: base % 4,
		},
	];
}

function makeModule(id: string, title: string, levelName: string): AcademyModule {
	return {
		id,
		title,
		description: `Introductory material for ${title}. Replace with detailed guidance.`,
		content: {
			html:
				`<h2 class="text-xl font-semibold mb-2">${title}</h2>` +
				`<p class="text-muted-foreground">Replace this with interactive write-ups, readings, or video embeds for ${levelName}. Keep tone practical and classroom-focused.</p>`,
		},
		quiz: makePlaceholderQuestions(id + title),
	};
}

export const ACADEMY_LEVELS: AcademyLevel[] = [
	{
		id: 'nursery',
		name: 'Nursery',
		description: 'Early childhood pedagogy, play-based learning, and safety basics.',
		modules: [
			{
				id: 'n1',
				title: 'Understanding Early Childhood Education in Cameroon',
				description: 'Learn how nursery education fits within Cameroon\'s education system, the main objectives and stages of early childhood learning, and the tutor\'s role in guiding holistic development.',
				content: {
					html: `<div class="space-y-6">
						<div class="bg-primary/5 border-l-4 border-primary p-4 rounded-r-lg">
							<h3 class="font-bold text-lg mb-3 text-primary">🎯 Learning Objectives</h3>
							<p class="text-sm mb-2">By the end of this module, tutors should be able to:</p>
							<ul class="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-4">
								<li>Explain how nursery education fits within Cameroon's education system.</li>
								<li>Identify the main objectives and stages of early childhood learning (ages 3–5).</li>
								<li>Describe the 6 key areas of the national nursery curriculum.</li>
								<li>Understand the tutor's role in guiding holistic development through play and interaction.</li>
							</ul>
						</div>

						<section class="space-y-4">
							<h2 class="text-2xl font-bold text-primary">1.1 Overview of the Cameroon Education System</h2>
							<h3 class="text-xl font-semibold">The Structure</h3>
							<p class="text-muted-foreground">Cameroon's Basic Education system includes:</p>
							<ul class="list-disc list-inside space-y-2 ml-4 text-muted-foreground">
								<li><strong>Nursery School:</strong> Ages 3–5 (non-compulsory)</li>
								<li><strong>Primary School:</strong> Ages 6–11</li>
								<li>Secondary and Higher Education follow afterward.</li>
							</ul>
							<div class="bg-muted/50 p-4 rounded-lg my-4">
								<ul class="space-y-1 text-sm">
									<li><strong>Governing Body:</strong> Ministry of Basic Education (MINEDUB)</li>
									<li><strong>Language Policy:</strong> Bilingual (English and French)</li>
									<li><strong>Curriculum Type:</strong> Play-based and holistic</li>
								</ul>
							</div>
							<p class="text-muted-foreground italic">Nursery is not an early version of primary school — it is foundational learning through play, where children discover language, movement, and cooperation.</p>
							<blockquote class="border-l-4 border-primary/50 pl-4 italic text-muted-foreground">
								"Children learn best through doing, not through drilling." – Friedrich Froebel (Founder of Kindergarten)
							</blockquote>
							
							<h3 class="text-xl font-semibold mt-6">Why Nursery Matters</h3>
							<p class="text-muted-foreground">Research from UNICEF and UNESCO (2023) shows that children who attend quality early childhood programs are:</p>
							<ul class="list-disc list-inside space-y-1 ml-4 text-muted-foreground">
								<li>50% more likely to succeed in primary school,</li>
								<li>Have stronger social and emotional skills, and</li>
								<li>Show better attention and memory development.</li>
							</ul>
							<div class="bg-primary/5 p-4 rounded-lg my-4">
								<p class="font-semibold mb-2">Example Scenario:</p>
								<p class="text-sm text-muted-foreground">A tutor helps children sort red and blue blocks. They learn counting (math), colors (science), and teamwork (social).</p>
								<p class="text-sm text-primary font-medium mt-2">→ This activity builds school readiness naturally.</p>
							</div>
						</section>

						<section class="space-y-4">
							<h2 class="text-2xl font-bold text-primary">1.2 Objectives of Nursery Education (Ages 3–5)</h2>
							<p class="text-muted-foreground">According to the National Nursery Curriculum, early education targets six core developmental areas:</p>
							<div class="overflow-x-auto my-4">
								<table class="min-w-full border-collapse border border-primary/20">
									<thead class="bg-primary/10">
										<tr>
											<th class="border border-primary/20 p-2 text-left text-sm font-semibold">Area</th>
											<th class="border border-primary/20 p-2 text-left text-sm font-semibold">Objective</th>
											<th class="border border-primary/20 p-2 text-left text-sm font-semibold">Example in Class</th>
										</tr>
									</thead>
									<tbody class="text-sm">
										<tr>
											<td class="border border-primary/20 p-2 font-medium">Language & Communication</td>
											<td class="border border-primary/20 p-2">Speak clearly, express needs, follow instructions</td>
											<td class="border border-primary/20 p-2">"I want juice" instead of crying</td>
										</tr>
										<tr class="bg-muted/30">
											<td class="border border-primary/20 p-2 font-medium">Social & Emotional Growth</td>
											<td class="border border-primary/20 p-2">Build friendships, share, manage emotions</td>
											<td class="border border-primary/20 p-2">Comfort a friend who fell</td>
										</tr>
										<tr>
											<td class="border border-primary/20 p-2 font-medium">Cognitive Development</td>
											<td class="border border-primary/20 p-2">Observe, ask questions, solve problems</td>
											<td class="border border-primary/20 p-2">"Why is the sky blue?"</td>
										</tr>
										<tr class="bg-muted/30">
											<td class="border border-primary/20 p-2 font-medium">Physical Development</td>
											<td class="border border-primary/20 p-2">Improve fine & gross motor skills</td>
											<td class="border border-primary/20 p-2">Hold pencil, jump on one foot</td>
										</tr>
										<tr>
											<td class="border border-primary/20 p-2 font-medium">Creativity & Aesthetics</td>
											<td class="border border-primary/20 p-2">Express imagination through art, music, drama</td>
											<td class="border border-primary/20 p-2">Draw family picture</td>
										</tr>
										<tr class="bg-muted/30">
											<td class="border border-primary/20 p-2 font-medium">Moral & Cultural Values</td>
											<td class="border border-primary/20 p-2">Learn respect, honesty, and traditions</td>
											<td class="border border-primary/20 p-2">Practice greetings in mother tongue</td>
										</tr>
									</tbody>
								</table>
							</div>
							<div class="bg-primary/5 p-4 rounded-lg my-4">
								<p class="font-semibold text-sm mb-2">💡 Tutor Tip:</p>
								<p class="text-sm text-muted-foreground">You teach these goals not only during lessons — but during snack time, play, and routines!</p>
							</div>
						</section>

						<section class="space-y-4">
							<h2 class="text-2xl font-bold text-primary">1.3 Stages of Nursery Learning in Cameroon</h2>
							<div class="overflow-x-auto my-4">
								<table class="min-w-full border-collapse border border-primary/20">
									<thead class="bg-primary/10">
										<tr>
											<th class="border border-primary/20 p-2 text-left text-sm font-semibold">Level</th>
											<th class="border border-primary/20 p-2 text-left text-sm font-semibold">Age Range</th>
											<th class="border border-primary/20 p-2 text-left text-sm font-semibold">Focus</th>
											<th class="border border-primary/20 p-2 text-left text-sm font-semibold">Examples</th>
										</tr>
									</thead>
									<tbody class="text-sm">
										<tr>
											<td class="border border-primary/20 p-2 font-medium">Nursery 1</td>
											<td class="border border-primary/20 p-2">3–4 years</td>
											<td class="border border-primary/20 p-2">Sensory exploration and self-awareness</td>
											<td class="border border-primary/20 p-2">Name body parts, play color games</td>
										</tr>
										<tr class="bg-muted/30">
											<td class="border border-primary/20 p-2 font-medium">Nursery 2</td>
											<td class="border border-primary/20 p-2">4–5 years</td>
											<td class="border border-primary/20 p-2">Communication and cooperation</td>
											<td class="border border-primary/20 p-2">Speak in short sentences, count to 10</td>
										</tr>
									</tbody>
								</table>
							</div>
							<div class="bg-muted/50 p-4 rounded-lg my-4">
								<p class="font-semibold mb-2 text-sm">🧠 Ratio of Play to Structure:</p>
								<ul class="space-y-1 text-sm text-muted-foreground ml-4">
									<li><strong>Nursery 1:</strong> 80% play / 20% structured</li>
									<li><strong>Nursery 2:</strong> 50% play / 50% structured</li>
								</ul>
							</div>
							<div class="bg-primary/5 p-4 rounded-lg my-4">
								<p class="font-semibold text-sm mb-2">Key TEFL Link:</p>
								<p class="text-sm text-muted-foreground italic">Just as young language learners need repetition and games to master English sounds, nursery pupils need repetition through fun to build understanding.</p>
							</div>
						</section>

						<section class="space-y-4">
							<h2 class="text-2xl font-bold text-primary">1.4 Key Components of the Cameroon Nursery Curriculum</h2>
							<div class="overflow-x-auto my-4">
								<table class="min-w-full border-collapse border border-primary/20">
									<thead class="bg-primary/10">
										<tr>
											<th class="border border-primary/20 p-2 text-left text-sm font-semibold">Learning Area</th>
											<th class="border border-primary/20 p-2 text-left text-sm font-semibold">Goals</th>
											<th class="border border-primary/20 p-2 text-left text-sm font-semibold">Sample Activities</th>
											<th class="border border-primary/20 p-2 text-left text-sm font-semibold">Simple Assessment</th>
										</tr>
									</thead>
									<tbody class="text-sm">
										<tr>
											<td class="border border-primary/20 p-2 font-medium">Language Development</td>
											<td class="border border-primary/20 p-2">Improve speaking, listening</td>
											<td class="border border-primary/20 p-2">Songs, stories, "show and tell"</td>
											<td class="border border-primary/20 p-2">Can name 5 animals</td>
										</tr>
										<tr class="bg-muted/30">
											<td class="border border-primary/20 p-2 font-medium">Number Work</td>
											<td class="border border-primary/20 p-2">Recognize and count objects 1–10</td>
											<td class="border border-primary/20 p-2">Counting beans, shape sorting</td>
											<td class="border border-primary/20 p-2">Match 3 blocks to numeral 3</td>
										</tr>
										<tr>
											<td class="border border-primary/20 p-2 font-medium">Environmental Studies</td>
											<td class="border border-primary/20 p-2">Understand family, community, nature</td>
											<td class="border border-primary/20 p-2">Nature walk, role-play "market"</td>
											<td class="border border-primary/20 p-2">Draw "my house"</td>
										</tr>
										<tr class="bg-muted/30">
											<td class="border border-primary/20 p-2 font-medium">Creative Arts & Music</td>
											<td class="border border-primary/20 p-2">Express imagination</td>
											<td class="border border-primary/20 p-2">Painting, dance, singing</td>
											<td class="border border-primary/20 p-2">Make bead patterns</td>
										</tr>
										<tr>
											<td class="border border-primary/20 p-2 font-medium">Physical & Psychomotor Skills</td>
											<td class="border border-primary/20 p-2">Build coordination and control</td>
											<td class="border border-primary/20 p-2">Obstacle course, cutting</td>
											<td class="border border-primary/20 p-2">Catch a ball 3 times</td>
										</tr>
										<tr class="bg-muted/30">
											<td class="border border-primary/20 p-2 font-medium">Moral & Social Education</td>
											<td class="border border-primary/20 p-2">Encourage kindness and respect</td>
											<td class="border border-primary/20 p-2">Group games, "thank you" practice</td>
											<td class="border border-primary/20 p-2">Shares toys willingly</td>
										</tr>
									</tbody>
								</table>
							</div>
							<div class="bg-primary/5 p-4 rounded-lg my-4">
								<p class="font-semibold text-sm mb-2">💡 Integration Tip:</p>
								<p class="text-sm text-muted-foreground">You can combine areas — e.g., sing a counting song about animals → covers math + music + science.</p>
							</div>
						</section>

						<section class="space-y-4">
							<h2 class="text-2xl font-bold text-primary">1.5 The Role of the Tutor in Early Learning</h2>
							<p class="text-muted-foreground font-semibold mb-3">You Are:</p>
							<div class="space-y-3">
								<div class="flex items-start gap-3">
									<span class="text-2xl">🎨</span>
									<div>
										<p class="font-semibold">A Facilitator of Play:</p>
										<p class="text-sm text-muted-foreground">Set up learning corners and guide discovery</p>
										<p class="text-sm italic text-primary/80">→ e.g., give blocks and ask, "How tall can you build?"</p>
									</div>
								</div>
								<div class="flex items-start gap-3">
									<span class="text-2xl">👀</span>
									<div>
										<p class="font-semibold">An Observer:</p>
										<p class="text-sm text-muted-foreground">Note skills and growth</p>
										<p class="text-sm italic text-primary/80">→ "Tiku can now name 3 shapes independently."</p>
									</div>
								</div>
								<div class="flex items-start gap-3">
									<span class="text-2xl">❤️</span>
									<div>
										<p class="font-semibold">An Emotional Anchor:</p>
										<p class="text-sm text-muted-foreground">Reassure and celebrate effort</p>
										<p class="text-sm italic text-primary/80">→ "You spilled your paint — let's clean it up together!"</p>
									</div>
								</div>
								<div class="flex items-start gap-3">
									<span class="text-2xl">🗣️</span>
									<div>
										<p class="font-semibold">A Language Model:</p>
										<p class="text-sm text-muted-foreground">Speak clearly, repeat correctly but gently</p>
									</div>
								</div>
								<div class="flex items-start gap-3">
									<span class="text-2xl">🤝</span>
									<div>
										<p class="font-semibold">A Bridge to Parents:</p>
										<p class="text-sm text-muted-foreground">Share positive updates, not only problems</p>
									</div>
								</div>
							</div>
							<div class="bg-primary/10 border-2 border-primary/30 p-4 rounded-lg my-4">
								<p class="font-bold text-primary">Golden Rule:</p>
								<p class="text-lg font-semibold italic">"First relationship, then learning."</p>
								<p class="text-sm text-muted-foreground mt-2">A child who feels safe learns faster.</p>
							</div>
						</section>

						<section class="space-y-4 mt-6">
							<div class="bg-primary/5 p-4 rounded-lg">
								<h3 class="font-bold text-lg mb-3">🌼 Reflection Activity</h3>
								<p class="text-muted-foreground mb-2">Think of a time you played with a small child.</p>
								<p class="text-sm text-muted-foreground mb-2">What did they learn during that moment, even if it wasn't a "lesson"?</p>
								<p class="text-xs text-primary/80 italic mb-3">(Example: Sharing, counting, color recognition, patience)</p>
								<p class="text-sm font-semibold">Write 3 examples in your training journal.</p>
							</div>
						</section>
					</div>`,
					videos: [
						{ youtubeUrl: 'https://youtu.be/tf2ishCttRM?si=dvMXuSTxqHvf0NPT', caption: 'What is Early Childhood Education? – UNICEF' },
						{ youtubeUrl: '', caption: 'Play-based Learning Explained – The Teaching Channel' },
						{ youtubeUrl: 'https://youtu.be/tf2ishCttRM?si=dvMXuSTxqHvf0NPT', caption: 'Stages of Child Development – Oxford TEFL' },
						{ youtubeUrl: 'https://youtu.be/tf2ishCttRM?si=dvMXuSTxqHvf0NPT', caption: 'Creative Learning in Early Years – Cambridge English' },
						{ youtubeUrl: 'https://youtu.be/tf2ishCttRM?si=dvMXuSTxqHvf0NPT', caption: 'The Role of the Teacher in Early Childhood – UNICEF Education' },
					],
				},
                sections: [
                    {
                        id: '1-1',
                        title: '1.1 Overview of the Cameroon Education System',
                        html: `<p class="text-muted-foreground">Cameroon Basic Education includes Nursery (3–5), Primary (6–11), followed by Secondary and Higher Education. MINEDUB oversees a bilingual, play‑based, holistic approach.</p>
                        <ul class="list-disc list-inside ml-4 text-sm text-muted-foreground">
                            <li>Nursery lays the foundation via play, routines, and exploration.</li>
                            <li>Focus on language, movement, curiosity, and cooperation.</li>
                        </ul>

                        <div class="mt-8 space-y-4">
                            <h3 class="text-xl font-semibold text-primary">Why Nursery Matters</h3>
                            <p class="text-muted-foreground">Research from UNICEF and UNESCO (2023) shows that children who attend quality early childhood programs are:</p>
                            <ul class="list-disc list-inside ml-4 space-y-2 text-muted-foreground">
                                <li>50% more likely to succeed in primary school,</li>
                                <li>Have stronger social and emotional skills, and</li>
                                <li>Show better attention and memory development.</li>
                            </ul>

                            <div class="bg-primary/5 p-4 rounded-lg mt-4">
                                <p class="font-semibold mb-2">Example Scenario:</p>
                                <p class="text-sm text-muted-foreground">A tutor helps children sort red and blue blocks. They learn counting (math), colors (science), and teamwork (social).</p>
                                <p class="text-sm text-primary font-medium mt-2">→ This activity builds school readiness naturally.</p>
                            </div>
                        </div>`,
                        youtubeUrl: 'https://youtu.be/tf2ishCttRM?si=dvMXuSTxqHvf0NPT',
                        caption: 'What is Early Childhood Education? – UNICEF',
                    },
					{
						id: '1-2',
						title: '1.2 Objectives of Nursery Education (Ages 3–5)',
						html: `<div class="space-y-4">
							<p class="text-muted-foreground">According to the National Nursery Curriculum, early education targets six core developmental areas. These goals are taught not only during lessons but through routines, play, and daily interactions.</p>
							<div class="overflow-x-auto my-4">
								<table class="min-w-full border-collapse border border-primary/20">
									<thead class="bg-primary/10">
										<tr>
											<th class="border border-primary/20 p-2 text-left text-sm font-semibold">Area</th>
											<th class="border border-primary/20 p-2 text-left text-sm font-semibold">Objective</th>
											<th class="border border-primary/20 p-2 text-left text-sm font-semibold">Example in Class</th>
										</tr>
									</thead>
									<tbody class="text-sm">
										<tr>
											<td class="border border-primary/20 p-2 font-medium">Language & Communication</td>
											<td class="border border-primary/20 p-2">Speak clearly, express needs, follow instructions</td>
											<td class="border border-primary/20 p-2">"I want juice" instead of crying</td>
										</tr>
										<tr class="bg-muted/30">
											<td class="border border-primary/20 p-2 font-medium">Social & Emotional Growth</td>
											<td class="border border-primary/20 p-2">Build friendships, share, manage emotions</td>
											<td class="border border-primary/20 p-2">Comfort a friend who fell</td>
										</tr>
										<tr>
											<td class="border border-primary/20 p-2 font-medium">Cognitive Development</td>
											<td class="border border-primary/20 p-2">Observe, ask questions, solve problems</td>
											<td class="border border-primary/20 p-2">"Why is the sky blue?"</td>
										</tr>
										<tr class="bg-muted/30">
											<td class="border border-primary/20 p-2 font-medium">Physical Development</td>
											<td class="border border-primary/20 p-2">Improve fine & gross motor skills</td>
											<td class="border border-primary/20 p-2">Hold pencil, jump on one foot</td>
										</tr>
										<tr>
											<td class="border border-primary/20 p-2 font-medium">Creativity & Aesthetics</td>
											<td class="border border-primary/20 p-2">Express imagination through art, music, drama</td>
											<td class="border border-primary/20 p-2">Draw family picture</td>
										</tr>
										<tr class="bg-muted/30">
											<td class="border border-primary/20 p-2 font-medium">Moral & Cultural Values</td>
											<td class="border border-primary/20 p-2">Learn respect, honesty, and traditions</td>
											<td class="border border-primary/20 p-2">Practice greetings in mother tongue</td>
										</tr>
									</tbody>
								</table>
							</div>
							<div class="bg-primary/5 p-4 rounded-lg my-4">
								<p class="font-semibold text-sm mb-2">💡 Tutor Tip:</p>
								<p class="text-sm text-muted-foreground">You teach these goals not only during lessons — but during snack time, play, and routines!</p>
							</div>
						</div>`,
						youtubeUrl: 'https://www.youtube.com/watch?v=Tg9oZYOvg4s',
						caption: 'Play-based Learning Explained – The Teaching Channel',
					},
                    {
                        id: '1-3',
                        title: '1.3 Stages of Nursery Learning in Cameroon',
                        html: `<p class="text-muted-foreground">Nursery 1 (3–4): 80% play / 20% structure. Nursery 2 (4–5): 50% play / 50% structure. Repetition through fun builds understanding.</p>`,
                        youtubeUrl: 'https://youtu.be/tf2ishCttRM?si=dvMXuSTxqHvf0NPT',
                        caption: 'Stages of Child Development – Oxford TEFL',
                    },
                    {
                        id: '1-4',
                        title: '1.4 Key Components of the Nursery Curriculum',
                        html: `<p class="text-muted-foreground">Blend language, number work, environmental studies, creative arts, psychomotor skills, and moral education using integrated activities.</p>`,
                        youtubeUrl: 'https://youtu.be/tf2ishCttRM?si=dvMXuSTxqHvf0NPT',
                        caption: 'Creative Learning in Early Years – Cambridge English',
                    },
                    {
                        id: '1-5',
                        title: '1.5 The Tutor’s Role in Early Learning',
                        html: `<p class="text-muted-foreground">Be a facilitator of play, an observer, an emotional anchor, a language model, and a bridge to parents. First relationship, then learning.</p>`,
                        youtubeUrl: 'https://youtu.be/tf2ishCttRM?si=dvMXuSTxqHvf0NPT',
                        caption: 'The Role of the Teacher in Early Childhood – UNICEF Education',
                    },
                ],
				quiz: [
					{
						question: 'The Cameroon Nursery level is part of which education branch?',
						options: ['Secondary', 'Basic', 'Higher', 'Technical'],
						correctAnswerIndex: 1,
					},
					{
						question: 'Nursery education focuses mainly on:',
						options: ['Academic drilling', 'Play and holistic development', 'Preparing for exams', 'Memorization'],
						correctAnswerIndex: 1,
					},
					{
						question: 'The governing body for Nursery in Cameroon is:',
						options: ['MINESUP', 'MINEDUB', 'MINESEC', 'MINPROFF'],
						correctAnswerIndex: 1,
					},
					{
						question: 'The bilingual policy in Cameroon means:',
						options: ['Only English is used', 'Both English and French are used', 'Tutors choose their preferred language', 'Only French is used'],
						correctAnswerIndex: 1,
					},
					{
						question: 'Which of the following is NOT a core nursery objective?',
						options: ['Cognitive', 'Social-emotional', 'Scientific research', 'Physical development'],
						correctAnswerIndex: 2,
					},
					{
						question: 'In Nursery 1, lessons should be:',
						options: ['80% structured, 20% play', '50% structured, 50% play', '80% play, 20% structured', '100% structured'],
						correctAnswerIndex: 2,
					},
					{
						question: 'A tutor observes a child drawing a house and labeling it. This covers:',
						options: ['Environmental & Language development', 'Physical only', 'Math skills', 'Moral education only'],
						correctAnswerIndex: 0,
					},
					{
						question: 'What is the best way to correct a child\'s speech?',
						options: ['Say "That\'s wrong!"', 'Repeat the correct form naturally', 'Ignore and move on', 'Ask them to repeat 10 times'],
						correctAnswerIndex: 1,
					},
					{
						question: 'Nursery education is important because:',
						options: ['It helps children memorize early', 'It prepares children socially and cognitively for school', 'It replaces parental care', 'It reduces play time'],
						correctAnswerIndex: 1,
					},
					{
						question: 'The "first relationship, then learning" principle means:',
						options: ['Discipline before teaching', 'Build trust before instruction', 'Give homework before class', 'Test before teaching'],
						correctAnswerIndex: 1,
					},
					{
						question: 'Which area focuses on balance and coordination?',
						options: ['Moral development', 'Psychomotor skills', 'Cognitive development', 'Language development'],
						correctAnswerIndex: 1,
					},
					{
						question: 'The ideal learning language at nursery includes:',
						options: ['Only English', 'Mother tongue + official language', 'Only French', 'Only mother tongue'],
						correctAnswerIndex: 1,
					},
					{
						question: 'The best way to assess nursery pupils is:',
						options: ['Observation during play', 'Written exams', 'Oral recitation tests', 'Multiple choice tests'],
						correctAnswerIndex: 0,
					},
					{
						question: 'Example of cross-curricular integration is:',
						options: ['Teaching songs only', 'Singing a counting song about animals', 'Asking them to sit quietly', 'Teaching math separately'],
						correctAnswerIndex: 1,
					},
					{
						question: 'Which statement describes a tutor\'s primary role?',
						options: ['Give lectures', 'Facilitate and observe learning through play', 'Enforce tests and grades', 'Maintain strict discipline'],
						correctAnswerIndex: 1,
					},
				],
			},
			{
    id: 'n2',
    title: 'Child Development & Learning Psychology',
    description: 'Explore the key theories (Piaget, Erikson) governing how children aged 3–5 think, learn, and socialize, and apply positive, play-based strategies to manage behavior and support growth.',
    content: {
        html: `<div class="space-y-10">

            <div class="space-y-6">
                <h1 class="text-3xl font-bold text-primary mb-2">Module 2: Child Development & Learning Psychology</h1>
                <p class="text-muted-foreground mb-6">(Duration: ~30–40 minutes)</p>

                <div class="bg-primary/5 border-l-4 border-primary p-4 rounded-r-lg">
                    <h3 class="font-bold text-lg mb-3 text-primary">🎯 Learning Objectives</h3>
                    <p class="text-sm mb-2">By the end of this module, tutors should be able to:</p>
                    <ul class="list-disc list-inside space-y-2 text-sm text-muted-foreground ml-4">
                        <li>Explain how children aged 3–5 think, feel, and learn according to developmental theories.</li>
                        <li>Identify emotional, social, and cognitive milestones in early childhood.</li>
                        <li>Apply play-based learning and positive behavior strategies in class.</li>
                        <li>Recognize early signs of learning or developmental difficulties.</li>
                    </ul>
                </div>
            </div>

            <div class="space-y-6">
                <h2 class="text-2xl font-bold text-primary">2.1 Cognitive Development Stages</h2>
                <h3 class="text-xl font-semibold text-primary/90">(Piaget's Preoperational Stage)</h3>

                <div class="bg-secondary/5 p-4 rounded-lg">
                    <h4 class="font-semibold text-lg mb-3">🌱 Piaget's Theory Simplified</h4>
                    <p class="text-muted-foreground mb-4">
                        Jean Piaget (a Swiss psychologist) said children learn by actively exploring the world.
                        Ages 2–7 belong to the <strong>Preoperational Stage</strong> — a perfect match for nursery pupils (3–5 years).
                    </p>
                </div>

                <div class="relative overflow-x-auto shadow-sm rounded-lg">
                    <table class="w-full text-sm">
                        <thead class="bg-primary/5">
                            <tr>
                                <th class="px-4 py-3 text-left font-semibold">Characteristic</th>
                                <th class="px-4 py-3 text-left font-semibold">Description</th>
                                <th class="px-4 py-3 text-left font-semibold">Classroom Example</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr class="border-b border-primary/10">
                                <td class="px-4 py-3 font-medium">Symbolic Thinking</td>
                                <td class="px-4 py-3">Children use words and objects to represent things</td>
                                <td class="px-4 py-3">A stick becomes a horse</td>
                            </tr>
                            <tr class="border-b border-primary/10">
                                <td class="px-4 py-3 font-medium">Egocentrism</td>
                                <td class="px-4 py-3">They think everyone sees what they see</td>
                                <td class="px-4 py-3">Hides face &rarr; thinks you can't see them</td>
                            </tr>
                            <tr class="border-b border-primary/10">
                                <td class="px-4 py-3 font-medium">Centration</td>
                                <td class="px-4 py-3">Focus on one aspect at a time</td>
                                <td class="px-4 py-3">Thinks a tall cup has "more juice"</td>
                            </tr>
                            <tr class="border-b border-primary/10">
                                <td class="px-4 py-3 font-medium">Animism</td>
                                <td class="px-4 py-3">Believe objects have feelings</td>
                                <td class="px-4 py-3">"The chair hurt me!"</td>
                            </tr>
                            <tr class="border-b border-primary/10">
                                <td class="px-4 py-3 font-medium">No Conservation</td>
                                <td class="px-4 py-3">Struggle to understand quantity remains the same</td>
                                <td class="px-4 py-3">Two cups with same water but different shapes look "unequal"</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div class="bg-primary/5 p-4 rounded-lg mt-6">
                    <h4 class="font-semibold text-lg mb-3">👩‍🏫 Tutor Tips</h4>
                    <ul class="list-disc list-inside space-y-2 text-sm text-muted-foreground ml-4">
                        <li>Use <strong>real-life objects</strong> (beans, cups, toys) instead of pictures.</li>
                        <li>Encourage reasoning: "What do you think will happen if we pour the water?"</li>
                        <li>Never shame a wrong answer — children are thinking out loud!</li>
                        <li>Reinforce through <strong>hands-on play</strong>, not lectures.</li>
                    </ul>
                </div>
            </div>

            <div class="space-y-6">
                <h2 class="text-2xl font-bold text-primary">2.2 Emotional and Social Growth</h2>
                <h3 class="text-xl font-semibold text-primary/90">(Erikson's "Initiative vs Guilt" Stage)</h3>

                <div class="bg-secondary/5 p-4 rounded-lg">
                    <h4 class="font-semibold text-lg mb-3">🌼 Erik Erikson's Theory</h4>
                    <p class="text-muted-foreground mb-4">
                        Erikson believed children pass through stages of social-emotional growth. Ages 3–5: <strong>Initiative vs Guilt</strong>.
                        Children start to take <strong>initiative</strong>: lead games, imagine roles, try new tasks. If over-controlled or criticized &rarr; they feel <strong>guilty</strong> or shy.
                    </p>
                </div>

                <div class="relative overflow-x-auto shadow-sm rounded-lg">
                    <table class="w-full text-sm">
                        <thead class="bg-primary/5">
                            <tr>
                                <th class="px-4 py-3 text-left font-semibold">Skill</th>
                                <th class="px-4 py-3 text-left font-semibold">Age 3–5 Milestone</th>
                                <th class="px-4 py-3 text-left font-semibold">Example</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr class="border-b border-primary/10">
                                <td class="px-4 py-3 font-medium">Self-regulation</td>
                                <td class="px-4 py-3">Can wait briefly for turns</td>
                                <td class="px-4 py-3">Wait 2 minutes for snack</td>
                            </tr>
                            <tr class="border-b border-primary/10">
                                <td class="px-4 py-3 font-medium">Empathy</td>
                                <td class="px-4 py-3">Recognizes emotions in others</td>
                                <td class="px-4 py-3">"Awa is sad."</td>
                            </tr>
                            <tr class="border-b border-primary/10">
                                <td class="px-4 py-3 font-medium">Friendship</td>
                                <td class="px-4 py-3">Moves from parallel to cooperative play</td>
                                <td class="px-4 py-3">Builds a tower together</td>
                            </tr>
                            <tr class="border-b border-primary/10">
                                <td class="px-4 py-3 font-medium">Independence</td>
                                <td class="px-4 py-3">Wants to do things alone</td>
                                <td class="px-4 py-3">"I can tie my shoes!"</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div class="bg-primary/5 p-4 rounded-lg mt-6">
                    <h4 class="font-semibold text-lg mb-3">Tutor Strategies</h4>
                    <ul class="list-disc list-inside space-y-2 text-sm text-muted-foreground ml-4">
                        <li>✅ <strong>Acknowledge emotions</strong>: "You're angry — that's okay. Let's breathe."</li>
                        <li>✅ <strong>Praise effort</strong>, not only success: "You tried zipping your bag — great job!"</li>
                        <li>✅ <strong>Encourage leadership</strong>: "Who can help pass crayons?"</li>
                        <li>✅ Use emotion cards to teach feeling words.</li>
                    </ul>
                </div>
            </div>

            <div class="space-y-6">
                <h2 class="text-2xl font-bold text-primary">2.3 Learning Through Play</h2>

                <div class="bg-secondary/5 p-4 rounded-lg">
                    <h4 class="font-semibold text-lg mb-3">Why Play Is Powerful</h4>
                    <p class="text-muted-foreground mb-4">
                        Play is how young children learn language, logic, and social skills. <strong>"Play is the work of childhood."</strong> &mdash; Maria Montessori.
                    </p>
                    <p class="text-muted-foreground mb-4">
                        <strong>Educational Theories Supporting Play:</strong>
                        <ul class="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-4">
                            <li><strong>Friedrich Froebel</strong>: Founder of Kindergarten &rarr; "Play shapes learning."</li>
                            <li><strong>Lev Vygotsky</strong>: Children learn best through social interaction during play.</li>
                            <li><strong>Montessori</strong>: Play should be purposeful and hands-on.</li>
                        </ul>
                    </p>
                </div>

                <h4 class="font-semibold text-xl mb-3">🧩 Types of Play</h4>
                <div class="relative overflow-x-auto shadow-sm rounded-lg">
                    <table class="w-full text-sm">
                        <thead class="bg-primary/5">
                            <tr>
                                <th class="px-4 py-3 text-left font-semibold">Type</th>
                                <th class="px-4 py-3 text-left font-semibold">Description</th>
                                <th class="px-4 py-3 text-left font-semibold">Example Activity</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr class="border-b border-primary/10">
                                <td class="px-4 py-3 font-medium">Solitary Play</td>
                                <td class="px-4 py-3">Plays alone</td>
                                <td class="px-4 py-3">Building blocks quietly</td>
                            </tr>
                            <tr class="border-b border-primary/10">
                                <td class="px-4 py-3 font-medium">Parallel Play</td>
                                <td class="px-4 py-3">Plays beside others but not together</td>
                                <td class="px-4 py-3">Two kids drawing separately</td>
                            </tr>
                            <tr class="border-b border-primary/10">
                                <td class="px-4 py-3 font-medium">Cooperative Play</td>
                                <td class="px-4 py-3">Plays with shared goals</td>
                                <td class="px-4 py-3">Pretend cooking or "doctor" game</td>
                            </tr>
                            <tr class="border-b border-primary/10">
                                <td class="px-4 py-3 font-medium">Constructive Play</td>
                                <td class="px-4 py-3">Builds or creates something</td>
                                <td class="px-4 py-3">Making a house with clay</td>
                            </tr>
                            <tr class="border-b border-primary/10">
                                <td class="px-4 py-3 font-medium">Fantasy/Role Play</td>
                                <td class="px-4 py-3">Uses imagination</td>
                                <td class="px-4 py-3">Pretending to be a teacher</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div class="bg-primary/5 p-4 rounded-lg mt-6">
                    <h4 class="font-semibold text-lg mb-3">Play-Based Learning Examples</h4>
                    <ul class="list-disc list-inside space-y-2 text-sm text-muted-foreground ml-4">
                        <li><strong>Block Play:</strong> math &amp; science (counting, balancing)</li>
                        <li><strong>Pretend Play:</strong> empathy &amp; language ("doctor," "market")</li>
                        <li><strong>Sensory Play:</strong> science &amp; motor control (sand, water, dough)</li>
                    </ul>
                    <p class="mt-4 text-sm font-semibold text-primary">💡 Tutor Reminder: Never say "just playing" — say <strong>"learning through play."</strong></p>
                </div>
            </div>

            <div class="space-y-6">
                <h2 class="text-2xl font-bold text-primary">2.4 Attention Span & Behavior Management</h2>

                <h4 class="font-semibold text-xl mb-3">🕐 Average Attention Span</h4>
                <div class="relative overflow-x-auto shadow-sm rounded-lg">
                    <table class="w-full text-sm">
                        <thead class="bg-primary/5">
                            <tr>
                                <th class="px-4 py-3 text-left font-semibold">Age</th>
                                <th class="px-4 py-3 text-left font-semibold">Typical Focus Time</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr class="border-b border-primary/10">
                                <td class="px-4 py-3 font-medium">3 years</td>
                                <td class="px-4 py-3">3–5 minutes</td>
                            </tr>
                            <tr class="border-b border-primary/10">
                                <td class="px-4 py-3 font-medium">4 years</td>
                                <td class="px-4 py-3">5–8 minutes</td>
                            </tr>
                            <tr class="border-b border-primary/10">
                                <td class="px-4 py-3 font-medium">5 years</td>
                                <td class="px-4 py-3">8–10 minutes</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <p class="text-muted-foreground">Children lose focus easily — it's developmental, not disobedience!</p>

                <div class="bg-secondary/5 p-4 rounded-lg">
                    <h4 class="font-semibold text-lg mb-3">🧩 Why Children Wiggle</h4>
                    <ul class="list-disc list-inside space-y-2 text-sm text-muted-foreground ml-4">
                        <li>Brain still developing (prefrontal cortex is immature)</li>
                        <li>They need movement to learn — sitting still too long causes frustration.</li>
                    </ul>
                </div>

                <div class="bg-primary/5 p-4 rounded-lg mt-6">
                    <h4 class="font-semibold text-lg mb-3">🌈 Positive Management Strategies</h4>
                    <ul class="list-disc list-inside space-y-2 text-sm text-muted-foreground ml-4">
                        <li>✅ Keep lessons <strong>short</strong> (5–7 minutes per activity)</li>
                        <li>✅ Use <strong>transitions</strong>: "Clean up, clean up&hellip;" song</li>
                        <li>✅ Give <strong>choices</strong>: "Red cup or blue cup?"</li>
                        <li>✅ Display a <strong>visual routine chart</strong> (with pictures)</li>
                        <li>✅ Create a <strong>"calm corner"</strong> with soft toys or books</li>
                    </ul>
                    <p class="mt-4 text-sm font-semibold text-red-600">🚫 Avoid shouting, hitting, or long time-outs.</p>
                    <p class="text-sm text-muted-foreground">Use <strong>1 minute of calm for every year of age</strong> (max 5 min).</p>
                </div>
            </div>

            <div class="space-y-6">
                <h2 class="text-2xl font-bold text-primary">2.5 Recognizing Learning Difficulties or Delays</h2>

                <div class="bg-secondary/5 p-4 rounded-lg">
                    <h4 class="font-semibold text-lg mb-3">🩺 "Observe, Don't Diagnose."</h4>
                    <p class="text-muted-foreground">Tutors are not doctors — your job is to <strong>notice patterns and report early</strong>.</p>
                </div>

                <div class="relative overflow-x-auto shadow-sm rounded-lg">
                    <table class="w-full text-sm">
                        <thead class="bg-primary/5">
                            <tr>
                                <th class="px-4 py-3 text-left font-semibold">Area</th>
                                <th class="px-4 py-3 text-left font-semibold">Red Flags (By Age 5)</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr class="border-b border-primary/10">
                                <td class="px-4 py-3 font-medium">Speech</td>
                                <td class="px-4 py-3">&lt;50 words, no 2-word sentences</td>
                            </tr>
                            <tr class="border-b border-primary/10">
                                <td class="px-4 py-3 font-medium">Hearing</td>
                                <td class="px-4 py-3">Doesn't respond to name or loud sounds</td>
                            </tr>
                            <tr class="border-b border-primary/10">
                                <td class="px-4 py-3 font-medium">Vision</td>
                                <td class="px-4 py-3">Squints, tilts head, misses objects</td>
                            </tr>
                            <tr class="border-b border-primary/10">
                                <td class="px-4 py-3 font-medium">Motor Skills</td>
                                <td class="px-4 py-3">Can't hold crayon or catch ball</td>
                            </tr>
                            <tr class="border-b border-primary/10">
                                <td class="px-4 py-3 font-medium">Social</td>
                                <td class="px-4 py-3">Avoids play, no pretend games</td>
                            </tr>
                            <tr class="border-b border-primary/10">
                                <td class="px-4 py-3 font-medium">Behavior</td>
                                <td class="px-4 py-3">Tantrums &gt;10 min daily, aggression</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div class="bg-primary/5 p-4 rounded-lg mt-6">
                    <h4 class="font-semibold text-lg mb-3">💬 What to Do</h4>
                    <ol class="list-decimal list-inside space-y-2 text-sm text-muted-foreground ml-4">
                        <li><strong>Observe</strong> over 2–3 weeks.</li>
                        <li><strong>Record</strong> examples.</li>
                        <li><strong>Speak kindly with parents</strong>: "I've noticed Tiku struggles to focus — let's observe together."</li>
                        <li><strong>Suggest</strong> medical or educational screening (health post, SPE).</li>
                    </ol>
                    <p class="mt-4 text-sm font-semibold text-green-600">🌿 <strong>Support, don't label.</strong> Every child grows differently.</p>
                </div>

                <div class="bg-secondary/5 p-4 rounded-lg">
                    <h4 class="font-semibold text-lg mb-3">💬 Reflection Task</h4>
                    <p class="text-muted-foreground mb-4">Think about a child who had difficulty focusing or expressing themselves.</p>
                    <ul class="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-4">
                        <li>What behavior did you notice?</li>
                        <li>How could you have supported them more positively?</li>
                    </ul>
                    <p class="mt-2 text-sm text-muted-foreground">Write your reflection in your journal (5–7 sentences).</p>
                </div>
            </div>
        </div>`,
        videos: [
            { youtubeUrl: 'https://youtu.be/8I2gL8y8s3Y', caption: 'Piaget’s Stages of Cognitive Development – Khan Academy' },
            { youtubeUrl: 'https://youtu.be/3z-y3Vp8o_4', caption: 'Erikson’s Psychosocial Stages Explained – Simply Psychology' },
            { youtubeUrl: 'https://youtu.be/zS1r_C13zE4', caption: 'The Importance of Play in Early Learning – TEDx' },
            { youtubeUrl: 'https://youtu.be/j-3Qp50aW40', caption: 'Positive Behavior Management in Early Childhood – NAEYC' },
        ],
    },
    sections: [
        {
            id: 'n2s1',
            title: '2.1 Cognitive Development Stages',
            html: `<div class="space-y-4">
                <p class="text-muted-foreground">This section covers Piaget's Preoperational Stage (ages 2-7). Key characteristics of this stage include Egocentrism (difficulty seeing others' perspectives), Centration (focusing on only one feature of an object), and the development of Symbolic Thought (using objects to represent other things, like a banana as a phone). </p>
                <div class="bg-primary/5 p-4 rounded-lg">
                    <p class="font-semibold text-sm mb-2">Practical Tip:</p>
                    <p class="text-sm text-muted-foreground">To counter Centration, show a child two differently shaped containers with the same amount of water, and ask them to compare after pouring the water back into the original container. This helps teach Conservation.</p>
                </div>
            </div>`,
            youtubeUrl: 'https://youtu.be/8I2gL8y8s3Y',
            caption: 'Piaget’s Stages of Cognitive Development – Khan Academy',
        },
        {
            id: 'n2s2',
            title: '2.2 Emotional and Social Growth',
            html: `<div class="space-y-4">
                <p class="text-muted-foreground">Ages 3–5 fall into Erikson's Initiative vs. Guilt stage. Children start to plan activities and take charge. Tutors should encourage this initiative by giving choices and praising effort, or else the child may feel guilt about independent actions.</p>
                <ul class="list-disc list-inside space-y-1 ml-4 text-sm text-muted-foreground">
                    <li>Empathy emerges, so encourage them to notice friends' feelings.</li>
                    <li>Play progresses from solitary/parallel to cooperative play.</li>
                </ul>
            </div>`,
            youtubeUrl: 'https://youtu.be/3z-y3Vp8o_4',
            caption: 'Erikson’s Psychosocial Stages Explained – Simply Psychology',
        },
        {
            id: 'n2s3',
            title: '2.3 Learning Through Play',
            html: `<div class="space-y-4">
                <p class="text-muted-foreground">Play is the primary mode of learning. Tutors must guide constructive, fantasy, and cooperative play to build skills. For example, playing "market" develops math (counting money/items) and social skills (negotiating). Always refer to it as "learning through play."</p>
            </div>`,
            youtubeUrl: 'https://youtu.be/zS1r_C13zE4',
            caption: 'The Importance of Play in Early Learning – TEDx',
        },
        {
            id: 'n2s4',
            title: '2.4 Attention Span & Behavior Management',
            html: `<div class="space-y-4">
                <p class="text-muted-foreground">Average attention span for a 4-year-old is 5–8 minutes. Behavior is often communication, not defiance. Use positive strategies like short activities, visual schedules, firm-but-kind redirection, and natural consequences instead of punishment.</p>
            </div>`,
            youtubeUrl: 'https://youtu.be/j-3Qp50aW40',
            caption: 'Positive Behavior Management in Early Childhood – NAEYC',
        },
        {
            id: 'n2s5',
            title: '2.5 Recognizing Learning Difficulties or Delays',
            html: `<div class="space-y-4">
                <p class="text-muted-foreground">Tutors observe and record, but do not diagnose. Look for red flags in speech (few words), motor skills (can't hold a crayon), or severe behavior problems (daily long tantrums). Report concerns kindly to parents and the school administration for professional follow-up.</p>
            </div>`,
            youtubeUrl: 'https://www.youtube.com/watch?v=S8p5272L-2w',
            caption: 'Early Signs of Developmental Delays – Child Mind Institute',
        },
    ],
    quiz: [
        {
            question: 'According to Piaget, nursery children are in the:',
            options: ['Sensorimotor stage', 'Preoperational stage', 'Concrete operational stage'],
            correctAnswerIndex: 1,
        },
        {
            question: 'A child believes her doll is sad because it fell. This shows:',
            options: ['Centration', 'Animism', 'Conservation'],
            correctAnswerIndex: 1,
        },
        {
            question: 'Egocentrism means:',
            options: ['Thinking about others\' views', 'Only seeing one\'s own view', 'Playing in groups'],
            correctAnswerIndex: 1,
        },
        {
            question: 'Erikson\'s stage for ages 3–5 is:',
            options: ['Trust vs mistrust', 'Initiative vs guilt', 'Identity vs confusion'],
            correctAnswerIndex: 1,
        },
        {
            question: 'A 4-year-old who says, "I do it myself!" shows:',
            options: ['Initiative', 'Regression', 'Dependence'],
            correctAnswerIndex: 0,
        },
        {
            question: 'The best way to encourage emotional growth is to:',
            options: ['Ignore feelings', 'Validate and name emotions', 'Punish for crying'],
            correctAnswerIndex: 1,
        },
        {
            question: 'Which type of play involves acting out roles?',
            options: ['Solitary', 'Cooperative', 'Fantasy/Role play'],
            correctAnswerIndex: 2,
        },
        {
            question: 'Attention span of a 5-year-old is about:',
            options: ['2 minutes', '8–10 minutes', '15–20 minutes'],
            correctAnswerIndex: 1,
        },
        {
            question: 'The calm corner helps children:',
            options: ['Sleep during class', 'Regain emotional control', 'Avoid learning'],
            correctAnswerIndex: 1,
        },
        {
            question: 'The rule "1 minute per age" refers to:',
            options: ['Time-out or cool-down duration', 'Lesson time', 'Snack break'],
            correctAnswerIndex: 0,
        },
        {
            question: 'When noticing a child\'s learning delay, a tutor should:',
            options: ['Diagnose immediately', 'Observe and report gently', 'Ignore it'],
            correctAnswerIndex: 1,
        },
        {
            question: 'A child playing beside another but not with them is showing:',
            options: ['Cooperative play', 'Parallel play', 'Solitary play'],
            correctAnswerIndex: 1,
        },
        {
            question: 'Play-based learning is effective because it:',
            options: ['Is only for fun', 'Builds brain connections through experience', 'Avoids structure'],
            correctAnswerIndex: 1,
        },
        {
            question: 'Behavior management should focus on:',
            options: ['Fear and punishment', 'Positive reinforcement and choices', 'Ignoring misbehavior'],
            correctAnswerIndex: 1,
        },
        {
            question: 'Tutors are expected to:',
            options: ['Diagnose learning disorders', 'Support and refer concerns', 'Replace parents'],
            correctAnswerIndex: 1,
        }
    ],
},
	{
    id: 'n3',
    title: 'Curriculum and Lesson Planning (Full Expanded Edition)',
    description: 'Design schemes of work, daily lesson plans, and integrated activities that balance play with academic goals for nursery learners.',
    content: {
        html: `<div class="space-y-10">

            <div class="space-y-6">
                <h1 class="text-3xl font-bold text-primary mb-2">Module 3 — Curriculum and Lesson Planning (Full Expanded Edition)</h1>
                <p class="text-muted-foreground mb-6">(Duration: Variable — depends on practice tasks)</p>

                <div class="bg-primary/5 border-l-4 border-primary p-4 rounded-r-lg">
                    <h3 class="font-bold text-lg mb-3 text-primary">🎯 Learning Objectives</h3>
                    <p class="text-sm mb-2">By the end of this module, tutors will be able to:</p>
                    <ul class="list-disc list-inside space-y-2 text-sm text-muted-foreground ml-4">
                        <li>Explain the purpose of a scheme of work and lesson plan within the national nursery curriculum.</li>
                        <li>Design structured yet flexible daily and weekly plans based on national themes.</li>
                        <li>Integrate multiple learning areas in one lesson using play-based and creative methods.</li>
                        <li>Reflect on how to balance academic goals with emotional and social development.</li>
                        <li>Adapt plans for bilingual or mixed-ability groups.</li>
                    </ul>
                </div>
            </div>

            <div class="space-y-6">
                <h2 class="text-2xl font-bold text-primary">3.1 What is a Scheme of Work?</h2>
                <p class="text-muted-foreground">A Scheme of Work is your term roadmap—it ensures you follow the national syllabus systematically without skipping essential topics.</p>
                <div class="bg-secondary/5 p-4 rounded-lg">
                    <h4 class="font-semibold text-lg mb-3">💡 Key Features</h4>
                    <ul class="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-4">
                        <li>Derived from the MINEDUB Nursery Syllabus.</li>
                        <li>Covers one term (10–12 weeks) at a time.</li>
                        <li>Divided into themes and subthemes that reflect the child’s immediate environment.</li>
                        <li>Ensures progression from simple to complex concepts.</li>
                    </ul>
                </div>

                <div class="mt-4">
                    <h4 class="font-semibold">🏫 Example: Scheme of Work (Term 1 – Nursery 1)</h4>
                    <div class="text-sm text-muted-foreground">
                        <p>Week 1 – Theme: My School – Subtheme: Classroom rules – Learning Area Focus: Language, Social skills – Suggested Activities: Story on good manners, classroom tour</p>
                        <p>Week 2 – Theme: My Body – Subtheme: Parts of the body – Learning Area Focus: Science, Art – Suggested Activities: Song “Head, shoulders, knees & toes,” draw self</p>
                        <p>Week 3 – Theme: My Family – Subtheme: Family members – Learning Area Focus: Language, Drama – Suggested Activities: “Daddy Finger” song, role play</p>
                        <p>Week 4 – Theme: Food – Subtheme: Healthy eating – Learning Area Focus: Science, Math – Suggested Activities: Sorting fruits/vegetables</p>
                        <p>Week 5 – Theme: Safety – Subtheme: Home & road safety – Learning Area Focus: Civic, Music – Suggested Activities: Story of crossing road, safety song</p>
                    </div>
                </div>

                <div class="bg-primary/5 p-4 rounded-lg mt-4">
                    <h4 class="font-semibold">📘 Tutor Reflection</h4>
                    <p class="text-sm text-muted-foreground">Are your weekly themes relevant to your learners’ daily lives? Which activities can you adapt using locally available materials (bottle caps, stones, leaves)? How will you include bilingual vocabulary? (Ex: “papa – father”)</p>
                </div>

                <div class="bg-secondary/5 p-4 rounded-lg mt-4">
                    <h4 class="font-semibold">🧩 Mini Practice</h4>
                    <p class="text-sm text-muted-foreground">Draft a 2-week scheme of work under the theme “My Environment.” Week 1: My House. Week 2: My School. Add one key activity per learning area.</p>
                </div>
            </div>

            <div class="space-y-6">
                <h2 class="text-2xl font-bold text-primary">3.2 The Daily Lesson Plan</h2>
                <p class="text-muted-foreground">A lesson plan converts your scheme into a daily action guide. It ensures every session is intentional, engaging, and age-appropriate.</p>
                <div class="bg-secondary/5 p-4 rounded-lg">
                    <h4 class="font-semibold">🧾 Essential Parts</h4>
                    <ol class="list-decimal list-inside space-y-2 text-sm text-muted-foreground ml-4">
                        <li>Objective — what learners should achieve by the end (e.g., “Pupils will identify 3 body parts.”)</li>
                        <li>Materials — teaching aids or tools (flashcards, mirror, crayons)</li>
                        <li>Introduction (3–5 min) — arouse interest (song or question)</li>
                        <li>Main Activity (10–15 min) — guided learning (draw a face, point and name body parts)</li>
                        <li>Assessment (Observation) — ask each child to name one body part</li>
                        <li>Conclusion/Wrap-up (5 min) — review and praise</li>
                        <li>Homework/Extension (optional) — family task</li>
                    </ol>
                </div>
                <div class="bg-primary/5 p-4 rounded-lg mt-4">
                    <h4 class="font-semibold">🧺 Materials in Low-Resource Settings</h4>
                    <p class="text-sm text-muted-foreground">Bottle tops → counting, colors; Sand tray → writing letters; Old newspapers → collage; Stones & leaves → sorting and pattern-making</p>
                </div>
            </div>

            <div class="space-y-6">
                <h2 class="text-2xl font-bold text-primary">3.3 Working with National Syllabus Themes</h2>
                <p class="text-muted-foreground">Themes link lessons to a child’s environment—making abstract ideas concrete. Each term’s theme has language, math, science, and creative art dimensions.</p>
                <div class="bg-secondary/5 p-4 rounded-lg mt-2">
                    <h4 class="font-semibold">🌍 Example: “Weather and Seasons”</h4>
                    <p class="text-sm text-muted-foreground">Language: Story “Rainy Day at School”; Science: Observe daily weather; Math: Count rainy days; Art: Paint the sky; Music: Sing “Rain, rain, go away”</p>
                </div>
            </div>

            <div class="space-y-6">
                <h2 class="text-2xl font-bold text-primary">3.4 Integrating Learning Areas</h2>
                <p class="text-muted-foreground">Integration means weaving different learning domains—cognitive, physical, emotional, and social—into one rich activity.</p>
                <div class="bg-secondary/5 p-4 rounded-lg mt-2">
                    <h4 class="font-semibold">🐶 Example: Theme – Our Pet Dog</h4>
                    <p class="text-sm text-muted-foreground">Language — describe the pet; Math — count legs; Science — animal care; Art — mould dog with clay; Social — talk about kindness to animals.</p>
                </div>
            </div>

            <div class="space-y-6">
                <h2 class="text-2xl font-bold text-primary">3.5 Balancing Academics with Play</h2>
                <p class="text-muted-foreground">Play is the child’s language of learning. Every structured lesson must include time for free or guided play.</p>
                <div class="bg-secondary/5 p-4 rounded-lg mt-2">
                    <h4 class="font-semibold">🎠 Types of Play</h4>
                    <p class="text-sm text-muted-foreground">Free Play, Guided Play, Dramatic Play, Outdoor Play — each supports different outcomes (imagination, concept development, social skills, physical development).</p>
                    <p class="mt-2 text-sm font-semibold text-primary">🧩 Balance Formula: 70% Play, 20% Mini-lessons, 10% Routines & transitions</p>
                </div>
            </div>

            <div class="space-y-6">
                <h2 class="text-2xl font-bold text-primary">3.6 Reflection and Evaluation</h2>
                <p class="text-muted-foreground">After each lesson or week: review what went well, note challenges, adjust activities, and record strong and weak areas in your Lesson Reflection Journal.</p>
            </div>
        </div>`,
        videos: [
            { youtubeUrl: 'https://www.youtube.com/watch?v=TeacherToolkit', caption: 'Understanding Scheme of Work – TeacherToolkit' },
            { youtubeUrl: 'https://www.youtube.com/watch?v=BritishCouncil', caption: 'Lesson Planning for Early Years – British Council TEFL' },
            { youtubeUrl: 'https://www.youtube.com/watch?v=TeachStarter', caption: 'Integrated Learning for Early Years – Teach Starter' },
        ],
    },
    sections: [
        {
            id: 'n3s1',
            title: '3.1 What is a Scheme of Work?',
            html: `<div class="space-y-4"><p class="text-muted-foreground">A Scheme of Work is a term-long roadmap that ensures syllabus coverage through weekly themes and clear learning outcomes. Divide the term into 10–12 weeks, each with a theme, subtheme and activities.</p></div>`,
            youtubeUrl: 'https://www.youtube.com/watch?v=TeacherToolkit',
            caption: 'Understanding Scheme of Work – TeacherToolkit',
        },
        {
            id: 'n3s2',
            title: '3.2 The Daily Lesson Plan',
            html: `<div class="space-y-4"><p class="text-muted-foreground">A lesson plan converts the scheme into a daily guide: objective, materials, introduction, main activity, assessment and wrap-up. Keep activities short and hands-on.</p></div>`,
            youtubeUrl: 'https://www.youtube.com/watch?v=BritishCouncil',
            caption: 'Lesson Planning for Early Years – British Council TEFL',
        },
        {
            id: 'n3s3',
            title: '3.3 Working with National Syllabus Themes',
            html: `<div class="space-y-4"><p class="text-muted-foreground">Use themes to anchor learning to children’s lives. Cross-link language, math, science and art across a week.</p></div>`,
            youtubeUrl: 'https://www.youtube.com/watch?v=TeacherTom',
            caption: 'Theme-Based Teaching in Early Childhood – Teacher Tom',
        },
        {
            id: 'n3s4',
            title: '3.4 Integrating Learning Areas',
            html: `<div class="space-y-4"><p class="text-muted-foreground">Plan activities that touch three or more learning areas (e.g., counting during role-play, describing during art, observing during science).</p></div>`,
            youtubeUrl: 'https://www.youtube.com/watch?v=TeachStarter',
            caption: 'Integrated Learning for Early Years – Teach Starter',
        },
        {
            id: 'n3s5',
            title: '3.5 Balancing Academics with Play',
            html: `<div class="space-y-4"><p class="text-muted-foreground">Keep play at the centre: 70% play, 20% mini-lessons, 10% routines. Observe play — it reveals learning.</p></div>`,
            youtubeUrl: 'https://www.youtube.com/watch?v=UNICEFCameroon',
            caption: 'Learning Through Play – UNICEF Cameroon',
        },
        {
            id: 'n3s6',
            title: '3.6 Reflection and Evaluation',
            html: `<div class="space-y-4"><p class="text-muted-foreground">Reflect after each lesson: what worked, what to change, and note actions in a Lesson Reflection Journal.</p></div>`,
            youtubeUrl: '',
            caption: '',
        },
    ],
    quiz: [
        {
            question: 'What is a Scheme of Work?',
            options: ['A list of children’s favorite activities', 'A roadmap for the term', 'A timetable for lunch only', 'A detailed grading system'],
            correctAnswerIndex: 1,
        },
        {
            question: 'How should a weekly theme be used in nursery?',
            options: ['Cover as many topics as possible each day', 'Focus deeply on one theme per week', 'Ignore the syllabus', 'Use a new theme every day'],
            correctAnswerIndex: 1,
        },
        {
            question: 'Which of the following is the correct order for a daily lesson plan?',
            options: ['Main activity → greeting → wrap-up → transition', 'Greeting & routine → introduction → main activity → wrap-up → transition', 'Wrap-up → main activity → greeting → transition → introduction', 'Introduction → transition → main activity → wrap-up → greeting'],
            correctAnswerIndex: 1,
        },
        {
            question: 'In the example “My Family” week, what activity could be used for Monday?',
            options: ['Make birthday card', 'Draw family, sing “Daddy Finger”', 'Invite a parent to speak', 'Review photos of pets'],
            correctAnswerIndex: 1,
        },
        {
            question: 'Why should lessons integrate multiple learning areas?',
            options: ['To fill time with different activities', 'To confuse children', 'To create rich brain connections', 'To reduce playtime'],
            correctAnswerIndex: 2,
        },
        {
            question: 'Which of these is a cross-curricular example for the theme “Our Pet Dog”?',
            options: ['Only reading about dogs', 'Count paws, describe the dog, draw it, and discuss care', 'Watch a video only', 'Sing a song about dogs only'],
            correctAnswerIndex: 1,
        },
        {
            question: 'What is the ideal ratio of play to structured learning in nursery lessons?',
            options: ['50% play, 50% structured', '70% play, 20% structured, 10% routines', '30% play, 60% structured, 10% routines', '100% structured learning'],
            correctAnswerIndex: 1,
        },
        {
            question: 'How can math be incorporated into play?',
            options: ['Counting jumps in obstacle course', 'Writing numbers on the board only', 'Giving worksheets without guidance', 'Ignoring numeracy'],
            correctAnswerIndex: 0,
        },
        {
            question: 'What is an example of literacy integration in a nursery lesson?',
            options: ['Singing “B-I-N-G-O”', 'Writing a paragraph', 'Reading a novel', 'Doing spelling tests'],
            correctAnswerIndex: 0,
        },
        {
            question: 'What is a warning sign that there is an imbalance between play and academics?',
            options: ['Children are engaged', 'Kids are bored or restless', 'Children cooperate in group work', 'Children share toys'],
            correctAnswerIndex: 1,
        },
        {
            question: 'When planning lessons, what is the best starting point?',
            options: ['The child’s world and experiences', 'Only what is in textbooks', 'Randomly selected topics', 'Teacher’s personal interests'],
            correctAnswerIndex: 0,
        },
        {
            question: 'How can repetition and spiraling be applied in nursery lessons?',
            options: ['Teach a concept once, then move on', 'Revisit concepts multiple times in different contexts', 'Only focus on new content every day', 'Ignore previous lessons'],
            correctAnswerIndex: 1,
        },
        {
            question: 'Which of the following should a lesson objective include?',
            options: ['Child behavior only', 'Specific learning outcome', 'Teacher instructions only', 'General aim without details'],
            correctAnswerIndex: 1,
        },
        {
            question: 'How can creative arts be included in a lesson on animals?',
            options: ['Painting animal pictures', 'Watching a video only', 'Singing unrelated songs', 'Ignoring art entirely'],
            correctAnswerIndex: 0,
        },
        {
            question: 'What is the main benefit of balancing academics with play?',
            options: ['Ensures children stay seated longer', 'Encourages active engagement and holistic development', 'Reduces the need for planning', 'Makes lessons easier for teachers'],
            correctAnswerIndex: 1,
        },
    ],
},
{
    id: "n4",
    title: "Teaching Methods for Nursery Pupils",
    description: "Master effective teaching strategies for early childhood, including using storytelling, songs, hands-on manipulatives, games, and daily routines to maximize learning and development.",
    content: {
        html: "<div class=\"space-y-10\">\n\n            <div class=\"space-y-6\">\n                <h1 class=\"text-3xl font-bold text-primary mb-2\">Module 4: Teaching Methods for Nursery Pupils</h1>\n                <p class=\"text-muted-foreground mb-6\">(Duration: ~30–40 minutes)</p>\n\n                <div class=\"bg-primary/5 border-l-4 border-primary p-4 rounded-r-lg\">\n                    <h3 class=\"font-bold text-lg mb-3 text-primary\">🎯 Learning Objectives</h3>\n                    <p class=\"text-sm mb-2\">By the end of this module, tutors will be able to:</p>\n                    <ul class=\"list-disc list-inside space-y-2 text-sm text-muted-foreground ml-4\">\n                        <li>Use storytelling, songs, and rhymes as effective teaching tools.</li>\n                        <li>Apply visuals, manipulatives, and hands-on activities to enhance learning.</li>\n                        <li>Organize classroom games to support literacy and numeracy development.</li>\n                        <li>Facilitate group work to promote social learning.</li>\n                        <li>Use daily routines as a teaching opportunity.</li>\n                    </ul>\n                </div>\n            </div>\n\n            <div class=\"space-y-6\">\n                <h2 class=\"text-2xl font-bold text-primary\">4.1 Storytelling and Songs as Teaching Tools</h2>\n                <h3 class=\"text-xl font-semibold text-primary/90\">(Language, Memory, and Emotion)</h3>\n\n                <div class=\"bg-secondary/5 p-4 rounded-lg\">\n                    <h4 class=\"font-semibold text-lg mb-3\">🔍 Elaboration: Why They Work</h4>\n                    <p class=\"text-muted-foreground mb-4\">\n                        Stories and songs are powerful because they combine language, memory, emotion, and culture. Children learn best when lessons are fun, relatable, and repeatable.\n                    </p>\n                    <ul class=\"list-disc list-inside space-y-1 text-sm text-muted-foreground ml-4\">\n                        <li><strong>Memory:</strong> Rhythm and rhyme aid retention</li>\n                        <li><strong>Language:</strong> Introduces new vocabulary in context</li>\n                        <li><strong>Social-emotional growth:</strong> Characters model empathy, problem-solving</li>\n                        <li><strong>Cultural connection:</strong> Local stories embed traditions</li>\n                    </ul>\n                </div>\n\n                <h4 class=\"font-semibold text-xl mb-3\">📝 Classroom Examples</h4>\n                <ul class=\"list-disc list-inside space-y-1 text-sm text-muted-foreground ml-4\">\n                    <li><strong>Story:</strong> “Anansi and the Pot of Beans” → teaches sharing and problem-solving</li>\n                    <li><strong>Song:</strong> “Muna Akong” (local lullaby with counting) → teaches numbers and rhythm</li>\n                </ul>\n\n                <div class=\"bg-primary/5 p-4 rounded-lg mt-6\">\n                    <h4 class=\"font-semibold text-lg mb-3\">👩‍🏫 Teaching Tips</h4>\n                    <ul class=\"list-disc list-inside space-y-2 text-sm text-muted-foreground ml-4\">\n                        <li>Use <strong>props</strong> (puppets, flannel boards, felt cutouts).</li>\n                        <li>Pause for prediction questions → “What happens next?”</li>\n                        <li>Repeat actions and sounds → “Head, Shoulders, Knees, and Toes”</li>\n                        <li>Use local names for relevance → “Awa, Tiku, Muma”</li>\n                    </ul>\n                </div>\n\n                <div class=\"bg-secondary/5 p-4 rounded-lg\">\n                    <h4 class=\"font-semibold text-lg mb-3\">🎨 Mini Activity</h4>\n                    <p class=\"text-muted-foreground\">Ask pupils to retell a short story using finger puppets or drawings. This reinforces comprehension, sequencing, and creativity.</p>\n                </div>\n            </div>\n\n            <div class=\"space-y-6\">\n                <h2 class=\"text-2xl font-bold text-primary\">4.2 Using Visuals and Manipulatives</h2>\n                <h3 class=\"text-xl font-semibold text-primary/90\">(Hands-on, Active Exploration)</h3>\n\n                <div class=\"bg-secondary/5 p-4 rounded-lg\">\n                    <h4 class=\"font-semibold text-lg mb-3\">🔍 Elaboration: What Are Manipulatives?</h4>\n                    <p class=\"text-muted-foreground mb-4\">\n                        <strong>Manipulatives</strong> are hands-on learning tools that let children explore concepts physically. They are vital for concrete learners in the nursery age group.\n                    </p>\n                </div>\n\n                <div class=\"relative overflow-x-auto shadow-sm rounded-lg\">\n                    <table class=\"w-full text-sm\">\n                        <thead class=\"bg-primary/5\">\n                            <tr>\n                                <th class=\"px-4 py-3 text-left font-semibold\">Type</th>\n                                <th class=\"px-4 py-3 text-left font-semibold\">Examples</th>\n                                <th class=\"px-4 py-3 text-left font-semibold\">Learning Purpose</th>\n                            </tr>\n                        </thead>\n                        <tbody>\n                            <tr class=\"border-b border-primary/10\">\n                                <td class=\"px-4 py-3 font-medium\">Real Objects</td>\n                                <td class=\"px-4 py-3\">Fruits, stones</td>\n                                <td class=\"px-4 py-3\">Counting, sorting</td>\n                            </tr>\n                            <tr class=\"border-b border-primary/10\">\n                                <td class=\"px-4 py-3 font-medium\">Pictures/Flashcards</td>\n                                <td class=\"px-4 py-3\">Animals, vehicles</td>\n                                <td class=\"px-4 py-3\">Vocabulary, matching</td>\n                            </tr>\n                            <tr class=\"border-b border-primary/10\">\n                                <td class=\"px-4 py-3 font-medium\">Models</td>\n                                <td class=\"px-4 py-3\">Toy animals, cars</td>\n                                <td class=\"px-4 py-3\">Role-play, problem-solving</td>\n                            </tr>\n                            <tr class=\"border-b border-primary/10\">\n                                <td class=\"px-4 py-3 font-medium\">Body</td>\n                                <td class=\"px-4 py-3\">Fingers, claps</td>\n                                <td class=\"px-4 py-3\">Rhythm, math, coordination</td>\n                            </tr>\n                        </tbody>\n                    </table>\n                </div>\n\n                <h4 class=\"font-semibold text-xl mb-3\">📋 Rules for Use</h4>\n                <ul class=\"list-disc list-inside space-y-1 text-sm text-muted-foreground ml-4\">\n                    <li>Must be **Big, colorful, and safe**</li>\n                    <li>Provide **1 set per 2–3 children**</li>\n                    <li>**Rotate weekly** to maintain interest and novelty</li>\n                </ul>\n\n                <div class=\"bg-primary/5 p-4 rounded-lg mt-6\">\n                    <h4 class=\"font-semibold text-lg mb-3\">💡 Tutor Tip</h4>\n                    <p class=\"text-sm font-semibold text-primary\">“Seeing &lt; Touching &lt; Doing.”</p>\n                    <p class=\"text-sm text-muted-foreground\">Let children physically manipulate items to deepen understanding. Hands-on learning is always superior to passive observation.</p>\n                </div>\n            </div>\n\n            <div class=\"space-y-6\">\n                <h2 class=\"text-2xl font-bold text-primary\">4.3 Classroom Games for Numeracy and Literacy</h2>\n                <h3 class=\"text-xl font-semibold text-primary/90\">(Active, Social, and Enjoyable Learning)</h3>\n\n                <div class=\"bg-secondary/5 p-4 rounded-lg\">\n                    <h4 class=\"font-semibold text-lg mb-3\">🔍 Elaboration: Why Games?</h4>\n                    <p class=\"text-muted-foreground mb-4\">\n                        Games make learning active, social, and enjoyable. Short, frequent games help children focus and internalize skills without feeling like work.\n                    </p>\n                </div>\n\n                <h4 class=\"font-semibold text-xl mb-3\">🔢 Numeracy Games</h4>\n                <ul class=\"list-disc list-inside space-y-1 text-sm text-muted-foreground ml-4\">\n                    <li><strong>Bean Bag Toss:</strong> Numbered baskets → count &amp; match</li>\n                    <li><strong>Musical Numbers:</strong> Music stops → child finds their number</li>\n                </ul>\n\n                <h4 class=\"font-semibold text-xl mb-3\">🔠 Literacy Games</h4>\n                <ul class=\"list-disc list-inside space-y-1 text-sm text-muted-foreground ml-4\">\n                    <li><strong>Sound Bingo:</strong> Match objects with initial sound</li>\n                    <li><strong>Letter Hunt:</strong> Hide letters in the classroom → “Find A!”</li>\n                </ul>\n\n                <h4 class=\"font-semibold text-xl mb-3\">✅ Rules for Games</h4>\n                <ul class=\"list-disc list-inside space-y-1 text-sm text-muted-foreground ml-4\">\n                    <li>Keep them **Short** (3–5 minutes)</li>\n                    <li>Ensure **Everyone wins** (focus on participation, avoid discouragement)</li>\n                    <li>Provide **Clear instructions** with demonstration</li>\n                </ul>\n\n                <div class=\"bg-secondary/5 p-4 rounded-lg\">\n                    <h4 class=\"font-semibold text-lg mb-3\">🎨 Mini Activity</h4>\n                    <p class=\"text-muted-foreground\">Prepare a “Number Hunt” using natural materials (leaves, stones, sticks) for outdoor learning.</p>\n                </div>\n            </div>\n\n            <div class=\"space-y-6\">\n                <h2 class=\"text-2xl font-bold text-primary\">4.4 Group Work and Social Learning</h2>\n                <h3 class=\"text-xl font-semibold text-primary/90\">(Vygotsky's Social Interaction)</h3>\n\n                <div class=\"bg-secondary/5 p-4 rounded-lg\">\n                    <h4 class=\"font-semibold text-lg mb-3\">🔍 Elaboration: Why Group Work?</h4>\n                    <p class=\"text-muted-foreground mb-4\">\n                        According to psychologist Vygotsky, children learn best when interacting with peers and adults. Group work develops crucial cooperation, empathy, and communication skills.\n                    </p>\n                </div>\n\n                <h4 class=\"font-semibold text-xl mb-3\">👥 Guidelines & Activities</h4>\n                <ul class=\"list-disc list-inside space-y-1 text-sm text-muted-foreground ml-4\">\n                    <li><strong>Age 3:</strong> Pairs or parallel play is most common.</li>\n                    <li><strong>Ages 4–5:</strong> Small groups (3–5 children) are effective.</li>\n                    <li><strong>Sample Activity:</strong> Role-play (Market, Doctor, Family) → builds social skills and empathy.</li>\n                    <li><strong>Sample Activity:</strong> Build a tower together → teaches math and fine motor skills.</li>\n                </ul>\n\n                <div class=\"bg-primary/5 p-4 rounded-lg mt-6\">\n                    <h4 class=\"font-semibold text-lg mb-3\">✅ Tutor Role in Group Work</h4>\n                    <ul class=\"list-disc list-inside space-y-2 text-sm text-muted-foreground ml-4\">\n                        <li>Assign roles (leader, recorder, cleaner) when appropriate.</li>\n                        <li>**Model positive communication** → “Ask, don’t grab.”</li>\n                        <li>**Praise teamwork** → “You helped Awa — kind friend!”</li>\n                        <li>Facilitate, don't dominate, the interaction.</li>\n                    </ul>\n                </div>\n            </div>\n\n            <div class=\"space-y-6\">\n                <h2 class=\"text-2xl font-bold text-primary\">4.5 Teaching Through Routines</h2>\n                <h3 class=\"text-xl font-semibold text-primary/90\">(The Hidden Curriculum)</h3>\n\n                <div class=\"bg-secondary/5 p-4 rounded-lg\">\n                    <h4 class=\"font-semibold text-lg mb-3\">🔍 Elaboration: Routines are Teaching Moments</h4>\n                    <p class=\"text-muted-foreground mb-4\">\n                        Daily routines are the hidden curriculum — crucial opportunities to teach responsibility, hygiene, emotional regulation, and language skills.\n                    </p>\n                </div>\n\n                <div class=\"relative overflow-x-auto shadow-sm rounded-lg\">\n                    <table class=\"w-full text-sm\">\n                        <thead class=\"bg-primary/5\">\n                            <tr>\n                                <th class=\"px-4 py-3 text-left font-semibold\">Routine</th>\n                                <th class=\"px-4 py-3 text-left font-semibold\">Phrase/Song</th>\n                                <th class=\"px-4 py-3 text-left font-semibold\">Learning Outcome</th>\n                            </tr>\n                        </thead>\n                        <tbody>\n                            <tr class=\"border-b border-primary/10\">\n                                <td class=\"px-4 py-3 font-medium\">Arrival</td>\n                                <td class=\"px-4 py-3\">“Good morning, how are you?”</td>\n                                <td class=\"px-4 py-3\">Greeting, mood check</td>\n                            </tr>\n                            <tr class=\"border-b border-primary/10\">\n                                <td class=\"px-4 py-3 font-medium\">Snack</td>\n                                <td class=\"px-4 py-3\">“Wash hands, rub rub rub”</td>\n                                <td class=\"px-4 py-3\">Hygiene &amp; fine motor</td>\n                            </tr>\n                            <tr class=\"border-b border-primary/10\">\n                                <td class=\"px-4 py-3 font-medium\">Pack Away</td>\n                                <td class=\"px-4 py-3\">“Clean up, clean up, everybody”</td>\n                                <td class=\"px-4 py-3\">Responsibility</td>\n                            </tr>\n                            <tr class=\"border-b border-primary/10\">\n                                <td class=\"px-4 py-3 font-medium\">Goodbye</td>\n                                <td class=\"px-4 py-3\">“See you later, alligator!”</td>\n                                <td class=\"px-4 py-3\">Closure &amp; memory</td>\n                            </tr>\n                        </tbody>\n                    </table>\n                </div>\n\n                <h4 class=\"font-semibold text-xl mb-3\">✅ Tips for Effective Routines</h4>\n                <ul class=\"list-disc list-inside space-y-1 text-sm text-muted-foreground ml-4\">\n                    <li>Use the **same song daily** → children feel secure and anticipate the next step.</li>\n                    <li>Integrate **short instructions** → language + routine learning.</li>\n                    <li>Encourage children to **lead parts of the routine** to build independence.</li>\n                </ul>\n\n                <div class=\"bg-primary/5 p-4 rounded-lg\">\n                    <h4 class=\"font-semibold text-lg mb-3\">🎨 Mini Activity</h4>\n                    <p class=\"text-muted-foreground\">Create a **“Routine Chart”** with pictures showing each daily step. Rotate a **“helper of the day”** to lead the class through the chart.</p>\n                </div>\n            </div>\n\n            <div class=\"space-y-6\">\n                <h2 class=\"text-2xl font-bold text-primary\">✅ Module 4 Summary</h2>\n\n                <ul class=\"list-disc list-inside space-y-2 text-sm text-muted-foreground ml-4\">\n                    <li>**Stories &amp; songs:** Language, memory, culture, emotion</li>\n                    <li>**Manipulatives:** Hands-on exploration of concepts</li>\n                    <li>**Games:** Active learning for numeracy &amp; literacy</li>\n                    <li>**Group work:** Social-emotional development, cooperative learning</li>\n                    <li>**Routines:** Teach life skills, reinforce structure and language</li>\n                </ul>\n\n                <div class=\"bg-secondary/5 p-4 rounded-lg\">\n                    <h4 class=\"font-semibold text-lg mb-3\">💬 Reflection Task</h4>\n                    <p class=\"text-muted-foreground mb-4\">Reflect on your current teaching methods:</p>\n                    <ul class=\"list-disc list-inside space-y-1 text-sm text-muted-foreground ml-4\">\n                        <li>Which one method can you commit to using **every day** this week to enhance your lesson?</li>\n                    </ul>\n                    <p class=\"mt-2 text-sm text-muted-foreground\">Write your commitment and plan in your journal (3–5 sentences).</p>\n                </div>\n            </div>\n        </div>",
        videos: [
            {
                youtubeUrl: "https://youtu.be/S8p5272L-2w",
                caption: "Storytelling Techniques for Early Childhood"
            },
            {
                youtubeUrl: "https://youtu.be/8I2gL8y8s3Y",
                caption: "Nursery Numeracy Games"
            },
            {
                youtubeUrl: "https://youtu.be/3z-y3Vp8o_4",
                caption: "The Importance of Play in Early Learning – TEDx"
            },
            {
                youtubeUrl: "https://youtu.be/j-3Qp50aW40",
                caption: "Positive Behavior Management in Early Childhood – NAEYC"
            }
        ]
    },
    sections: [
        {
            id: "n4s1",
            title: "4.1 Storytelling and Songs as Teaching Tools",
            html: "<div class=\"space-y-4\">\n                <p class=\"text-muted-foreground\">Stories and songs are fundamental tools because the rhythm and repetition aid memory (retention). They introduce new vocabulary in a meaningful context and help children process emotions through characters' actions (empathy, problem-solving).</p>\n                <div class=\"bg-primary/5 p-4 rounded-lg\">\n                    <p class=\"font-semibold text-sm mb-2\">Practical Tip:</p>\n                    <p class=\"text-sm text-muted-foreground\">Always use <Strong>props</Strong> (puppets, flannel boards) to make the story tangible and pause frequently to ask, “What happens next?” to engage critical thinking.</p>\n                </div>\n            </div>",
            youtubeUrl: "https://youtu.be/S8p5272L-2w",
            caption: "Storytelling Techniques for Early Childhood"
        },
        {
            id: "n4s2",
            title: "4.2 Using Visuals and Manipulatives",
            html: "<div class=\"space-y-4\">\n                <p class=\"text-muted-foreground\">Manipulatives are hands-on, concrete objects (like stones, blocks, fruits) that allow nursery pupils to physically explore concepts. This hands-on approach is vital because children at this age learn best by <Strong>doing</Strong>, not just watching or listening.</p>\n                <ul class=\"list-disc list-inside space-y-1 ml-4 text-sm text-muted-foreground\">\n                    <li>Ensure materials are safe, colorful, and age-appropriate.</li>\n                    <li>Rotate manipulatives weekly to keep the children interested.</li>\n                </ul>\n            </div>",
            youtubeUrl: "https://youtu.be/j-3Qp50aW40",
            caption: "The Role of Manipulatives in Early Math"
        },
        {
            id: "n4s3",
            title: "4.3 Classroom Games for Numeracy and Literacy",
            html: "<div class=\"space-y-4\">\n                <p class=\"text-muted-foreground\">Games (like Sound Bingo or Bean Bag Toss) keep learning active, social, and joyful. They are most effective when they are short (3–5 minutes) to match the child's attention span and when the instructions are clear and demonstrated first.</p>\n                <div class=\"bg-primary/5 p-4 rounded-lg\">\n                    <p class=\"font-semibold text-sm mb-2\">Rule:</p>\n                    <p class=\"text-sm text-muted-foreground\">Focus on participation and social learning; avoid games where only one child wins consistently to prevent discouragement.</p>\n                </div>\n            </div>",
            youtubeUrl: "https://youtu.be/8I2gL8y8s3Y",
            caption: "Nursery Numeracy Games"
        },
        {
            id: "n4s4",
            title: "4.4 Group Work and Social Learning",
            html: "<div class=\"space-y-4\">\n                <p class=\"text-muted-foreground\">Group work, especially collaborative activities like role-play (ages 4–5), promotes cooperation, empathy, and communication skills. The tutor's role is to facilitate by modeling positive language (“Ask, don’t grab”) and praising teamwork.</p>\n            </div>",
            youtubeUrl: "https://youtu.be/3z-y3Vp8o_4",
            caption: "Vygotsky's Social Learning Theory Explained"
        },
        {
            id: "n4s5",
            title: "4.5 Teaching Through Routines",
            html: "<div class=\"space-y-4\">\n                <p class=\"text-muted-foreground\">Daily routines (arrival, snack time, pack-away) are teaching opportunities for life skills, hygiene, responsibility, and language. Using consistent songs and phrases creates a predictable structure that makes children feel secure and ready to learn.</p>\n            </div>",
            youtubeUrl: "https://www.youtube.com/watch?v=kYI4j2U_Gk8",
            caption: "Using Daily Routines to Teach Toddlers"
        }
    ],
    quiz: [
        {
            question: "Why are stories effective in nursery teaching?",
            options: [
                "They fill time",
                "They teach only morals",
                "They teach language, memory, empathy",
                "They replace play"
            ],
            correctAnswerIndex: 2
        },
        {
            question: "What is the best type of manipulatives for nursery pupils?",
            options: [
                "Small objects that can be swallowed",
                "Hands-on, safe, and age-appropriate",
                "Textbooks only",
                "Worksheets"
            ],
            correctAnswerIndex: 1
        },
        {
            question: "The Bean Bag Toss game primarily teaches:",
            options: [
                "Numeracy and coordination",
                "Only social skills",
                "Literacy",
                "Hygiene"
            ],
            correctAnswerIndex: 0
        },
        {
            question: "Using a “talking stick” during circle time helps:",
            options: [
                "Teach counting",
                "Teach hygiene",
                "Promote social turn-taking",
                "Make children sit still"
            ],
            correctAnswerIndex: 2
        },
        {
            question: "Routine songs are important because:",
            options: [
                "They improve handwriting",
                "Build structure, security, and language",
                "They replace storytime",
                "They teach counting only"
            ],
            correctAnswerIndex: 1
        },
        {
            question: "Parallel play (playing beside others but not together) is common at what age?",
            options: [
                "3 years old",
                "4–5 years old",
                "6 years old",
                "2 years old"
            ],
            correctAnswerIndex: 0
        },
        {
            question: "Effective group size for 4–5-year-old nursery pupils is:",
            options: [
                "1–2 children",
                "3–5 children",
                "6–10 children",
                "10+ children"
            ],
            correctAnswerIndex: 1
        },
        {
            question: "Mini literacy games should ideally last:",
            options: [
                "10–15 minutes",
                "3–5 minutes",
                "20 minutes",
                "30 minutes"
            ],
            correctAnswerIndex: 1
        },
        {
            question: "Using props in storytelling helps:",
            options: [
                "Keep the tutor busy",
                "Test memory",
                "Engagement and imagination",
                "Reduce playtime"
            ],
            correctAnswerIndex: 2
        },
        {
            question: "Repetition in songs aids:",
            options: [
                "Memory and vocabulary",
                "Only social skills",
                "Only hygiene",
                "Only motor skills"
            ],
            correctAnswerIndex: 0
        },
        {
            question: "The tutor’s primary role in classroom games is to:",
            options: [
                "Watch quietly",
                "Model rules and encourage participation",
                "Correct mistakes harshly",
                "Only assign teams"
            ],
            correctAnswerIndex: 1
        },
        {
            question: "Teaching through routines primarily develops:",
            options: [
                "Literacy skills only",
                "Academic skills only",
                "Life skills and responsibility",
                "Only physical skills"
            ],
            correctAnswerIndex: 2
        },
        {
            question: "One key tip for manipulatives is to:",
            options: [
                "Give all materials at once",
                "Rotate weekly",
                "Use only digital objects",
                "Use adult-only tools"
            ],
            correctAnswerIndex: 1
        },
        {
            question: "Integration of games and learning:",
            options: [
                "Wastes time",
                "Confuses children",
                "Supports multiple learning domains",
                "Should be avoided"
            ],
            correctAnswerIndex: 2
        },
        {
            question: "Reflection after teaching helps tutors to:",
            options: [
                "Complain to colleagues",
                "Adjust and improve methods",
                "Impress supervisors",
                "Fill time"
            ],
            correctAnswerIndex: 1
        }
    ]
},

{
    id: "n5",
    title: "Classroom Management & Pupil Engagement",
    description: "This topic focuses on creating a positive and organized learning environment where pupils are motivated and actively involved in the learning process.",
    content: {
        html: "<div class=\"space-y-10\">\n\n            <div class=\"space-y-6\">\n                <h1 class=\"text-3xl font-bold text-primary mb-2\">Module 5: Classroom Management & Pupil Engagement</h1>\n                <p class=\"text-muted-foreground mb-6\">(Duration: ~30–40 minutes)</p>\n\n                <div class=\"bg-primary/5 border-l-4 border-primary p-4 rounded-r-lg\">\n                    <h3 class=\"font-bold text-lg mb-3 text-primary\">🎯 Learning Objectives</h3>\n                    <p class=\"text-sm mb-2\">By the end of this module, tutors will be able to:</p>\n                    <ul class=\"list-disc list-inside space-y-2 text-sm text-muted-foreground ml-4\">\n                        <li>Use storytelling, songs, and rhymes as effective teaching tools.</li>\n                        <li>Apply visuals, manipulatives, and hands-on activities to enhance learning.</li>\n                        <li>Organize classroom games to support literacy and numeracy development.</li>\n                        <li>Facilitate group work to promote social learning.</li>\n                        <li>Use daily routines as a teaching opportunity.</li>\n                    </ul>\n                </div>\n            </div>\n\n            <div class=\"space-y-6\">\n                <h2 class=\"text-2xl font-bold text-primary\">4.1 Storytelling and Songs as Teaching Tools</h2>\n                <h3 class=\"text-xl font-semibold text-primary/90\">(Language, Memory, and Emotion)</h3>\n\n                <div class=\"bg-secondary/5 p-4 rounded-lg\">\n                    <h4 class=\"font-semibold text-lg mb-3\">🔍 Elaboration: Why They Work</h4>\n                    <p class=\"text-muted-foreground mb-4\">\n                        Stories and songs are powerful because they combine language, memory, emotion, and culture. Children learn best when lessons are fun, relatable, and repeatable.\n                    </p>\n                    <ul class=\"list-disc list-inside space-y-1 text-sm text-muted-foreground ml-4\">\n                        <li><strong>Memory:</strong> Rhythm and rhyme aid retention</li>\n                        <li><strong>Language:</strong> Introduces new vocabulary in context</li>\n                        <li><strong>Social-emotional growth:</strong> Characters model empathy, problem-solving</li>\n                        <li><strong>Cultural connection:</strong> Local stories embed traditions</li>\n                    </ul>\n                </div>\n\n                <h4 class=\"font-semibold text-xl mb-3\">📝 Classroom Examples</h4>\n                <ul class=\"list-disc list-inside space-y-1 text-sm text-muted-foreground ml-4\">\n                    <li><strong>Story:</strong> “Anansi and the Pot of Beans” → teaches sharing and problem-solving</li>\n                    <li><strong>Song:</strong> “Muna Akong” (local lullaby with counting) → teaches numbers and rhythm</li>\n                </ul>\n\n                <div class=\"bg-primary/5 p-4 rounded-lg mt-6\">\n                    <h4 class=\"font-semibold text-lg mb-3\">👩‍🏫 Teaching Tips</h4>\n                    <ul class=\"list-disc list-inside space-y-2 text-sm text-muted-foreground ml-4\">\n                        <li>Use <strong>props</strong> (puppets, flannel boards, felt cutouts).</li>\n                        <li>Pause for prediction questions → “What happens next?”</li>\n                        <li>Repeat actions and sounds → “Head, Shoulders, Knees, and Toes”</li>\n                        <li>Use local names for relevance → “Awa, Tiku, Muma”</li>\n                    </ul>\n                </div>\n\n                <div class=\"bg-secondary/5 p-4 rounded-lg\">\n                    <h4 class=\"font-semibold text-lg mb-3\">🎨 Mini Activity</h4>\n                    <p class=\"text-muted-foreground\">Ask pupils to retell a short story using finger puppets or drawings. This reinforces comprehension, sequencing, and creativity.</p>\n                </div>\n            </div>\n\n            <div class=\"space-y-6\">\n                <h2 class=\"text-2xl font-bold text-primary\">4.2 Using Visuals and Manipulatives</h2>\n                <h3 class=\"text-xl font-semibold text-primary/90\">(Hands-on, Active Exploration)</h3>\n\n                <div class=\"bg-secondary/5 p-4 rounded-lg\">\n                    <h4 class=\"font-semibold text-lg mb-3\">🔍 Elaboration: What Are Manipulatives?</h4>\n                    <p class=\"text-muted-foreground mb-4\">\n                        <strong>Manipulatives</strong> are hands-on learning tools that let children explore concepts physically. They are vital for concrete learners in the nursery age group.\n                    </p>\n                </div>\n\n                <div class=\"relative overflow-x-auto shadow-sm rounded-lg\">\n                    <table class=\"w-full text-sm\">\n                        <thead class=\"bg-primary/5\">\n                            <tr>\n                                <th class=\"px-4 py-3 text-left font-semibold\">Type</th>\n                                <th class=\"px-4 py-3 text-left font-semibold\">Examples</th>\n                                <th class=\"px-4 py-3 text-left font-semibold\">Learning Purpose</th>\n                            </tr>\n                        </thead>\n                        <tbody>\n                            <tr class=\"border-b border-primary/10\">\n                                <td class=\"px-4 py-3 font-medium\">Real Objects</td>\n                                <td class=\"px-4 py-3\">Fruits, stones</td>\n                                <td class=\"px-4 py-3\">Counting, sorting</td>\n                            </tr>\n                            <tr class=\"border-b border-primary/10\">\n                                <td class=\"px-4 py-3 font-medium\">Pictures/Flashcards</td>\n                                <td class=\"px-4 py-3\">Animals, vehicles</td>\n                                <td class=\"px-4 py-3\">Vocabulary, matching</td>\n                            </tr>\n                            <tr class=\"border-b border-primary/10\">\n                                <td class=\"px-4 py-3 font-medium\">Models</td>\n                                <td class=\"px-4 py-3\">Toy animals, cars</td>\n                                <td class=\"px-4 py-3\">Role-play, problem-solving</td>\n                            </tr>\n                            <tr class=\"border-b border-primary/10\">\n                                <td class=\"px-4 py-3 font-medium\">Body</td>\n                                <td class=\"px-4 py-3\">Fingers, claps</td>\n                                <td class=\"px-4 py-3\">Rhythm, math, coordination</td>\n                            </tr>\n                        </tbody>\n                    </table>\n                </div>\n\n                <h4 class=\"font-semibold text-xl mb-3\">📋 Rules for Use</h4>\n                <ul class=\"list-disc list-inside space-y-1 text-sm text-muted-foreground ml-4\">\n                    <li>Must be **Big, colorful, and safe**</li>\n                    <li>Provide **1 set per 2–3 children**</li>\n                    <li>**Rotate weekly** to maintain interest and novelty</li>\n                </ul>\n\n                <div class=\"bg-primary/5 p-4 rounded-lg mt-6\">\n                    <h4 class=\"font-semibold text-lg mb-3\">💡 Tutor Tip</h4>\n                    <p class=\"text-sm font-semibold text-primary\">“Seeing &lt; Touching &lt; Doing.”</p>\n                    <p class=\"text-sm text-muted-foreground\">Let children physically manipulate items to deepen understanding. Hands-on learning is always superior to passive observation.</p>\n                </div>\n            </div>\n\n            <div class=\"space-y-6\">\n                <h2 class=\"text-2xl font-bold text-primary\">4.3 Classroom Games for Numeracy and Literacy</h2>\n                <h3 class=\"text-xl font-semibold text-primary/90\">(Active, Social, and Enjoyable Learning)</h3>\n\n                <div class=\"bg-secondary/5 p-4 rounded-lg\">\n                    <h4 class=\"font-semibold text-lg mb-3\">🔍 Elaboration: Why Games?</h4>\n                    <p class=\"text-muted-foreground mb-4\">\n                        Games make learning active, social, and enjoyable. Short, frequent games help children focus and internalize skills without feeling like work.\n                    </p>\n                </div>\n\n                <h4 class=\"font-semibold text-xl mb-3\">🔢 Numeracy Games</h4>\n                <ul class=\"list-disc list-inside space-y-1 text-sm text-muted-foreground ml-4\">\n                    <li><strong>Bean Bag Toss:</strong> Numbered baskets → count &amp; match</li>\n                    <li><strong>Musical Numbers:</strong> Music stops → child finds their number</li>\n                </ul>\n\n                <h4 class=\"font-semibold text-xl mb-3\">🔠 Literacy Games</h4>\n                <ul class=\"list-disc list-inside space-y-1 text-sm text-muted-foreground ml-4\">\n                    <li><strong>Sound Bingo:</strong> Match objects with initial sound</li>\n                    <li><strong>Letter Hunt:</strong> Hide letters in the classroom → “Find A!”</li>\n                </ul>\n\n                <h4 class=\"font-semibold text-xl mb-3\">✅ Rules for Games</h4>\n                <ul class=\"list-disc list-inside space-y-1 text-sm text-muted-foreground ml-4\">\n                    <li>Keep them **Short** (3–5 minutes)</li>\n                    <li>Ensure **Everyone wins** (focus on participation, avoid discouragement)</li>\n                    <li>Provide **Clear instructions** with demonstration</li>\n                </ul>\n\n                <div class=\"bg-secondary/5 p-4 rounded-lg\">\n                    <h4 class=\"font-semibold text-lg mb-3\">🎨 Mini Activity</h4>\n                    <p class=\"text-muted-foreground\">Prepare a “Number Hunt” using natural materials (leaves, stones, sticks) for outdoor learning.</p>\n                </div>\n            </div>\n\n            <div class=\"space-y-6\">\n                <h2 class=\"text-2xl font-bold text-primary\">4.4 Group Work and Social Learning</h2>\n                <h3 class=\"text-xl font-semibold text-primary/90\">(Vygotsky's Social Interaction)</h3>\n\n                <div class=\"bg-secondary/5 p-4 rounded-lg\">\n                    <h4 class=\"font-semibold text-lg mb-3\">🔍 Elaboration: Why Group Work?</h4>\n                    <p class=\"text-muted-foreground mb-4\">\n                        According to psychologist Vygotsky, children learn best when interacting with peers and adults. Group work develops crucial cooperation, empathy, and communication skills.\n                    </p>\n                </div>\n\n                <h4 class=\"font-semibold text-xl mb-3\">👥 Guidelines & Activities</h4>\n                <ul class=\"list-disc list-inside space-y-1 text-sm text-muted-foreground ml-4\">\n                    <li><strong>Age 3:</strong> Pairs or parallel play is most common.</li>\n                    <li><strong>Ages 4–5:</strong> Small groups (3–5 children) are effective.</li>\n                    <li><strong>Sample Activity:</strong> Role-play (Market, Doctor, Family) → builds social skills and empathy.</li>\n                    <li><strong>Sample Activity:</strong> Build a tower together → teaches math and fine motor skills.</li>\n                </ul>\n\n                <div class=\"bg-primary/5 p-4 rounded-lg mt-6\">\n                    <h4 class=\"font-semibold text-lg mb-3\">✅ Tutor Role in Group Work</h4>\n                    <ul class=\"list-disc list-inside space-y-2 text-sm text-muted-foreground ml-4\">\n                        <li>Assign roles (leader, recorder, cleaner) when appropriate.</li>\n                        <li>**Model positive communication** → “Ask, don’t grab.”</li>\n                        <li>**Praise teamwork** → “You helped Awa — kind friend!”</li>\n                        <li>Facilitate, don't dominate, the interaction.</li>\n                    </ul>\n                </div>\n            </div>\n\n            <div class=\"space-y-6\">\n                <h2 class=\"text-2xl font-bold text-primary\">4.5 Teaching Through Routines</h2>\n                <h3 class=\"text-xl font-semibold text-primary/90\">(The Hidden Curriculum)</h3>\n\n                <div class=\"bg-secondary/5 p-4 rounded-lg\">\n                    <h4 class=\"font-semibold text-lg mb-3\">🔍 Elaboration: Routines are Teaching Moments</h4>\n                    <p class=\"text-muted-foreground mb-4\">\n                        Daily routines are the hidden curriculum — crucial opportunities to teach responsibility, hygiene, emotional regulation, and language skills.\n                    </p>\n                </div>\n\n                <div class=\"relative overflow-x-auto shadow-sm rounded-lg\">\n                    <table class=\"w-full text-sm\">\n                        <thead class=\"bg-primary/5\">\n                            <tr>\n                                <th class=\"px-4 py-3 text-left font-semibold\">Routine</th>\n                                <th class=\"px-4 py-3 text-left font-semibold\">Phrase/Song</th>\n                                <th class=\"px-4 py-3 text-left font-semibold\">Learning Outcome</th>\n                            </tr>\n                        </thead>\n                        <tbody>\n                            <tr class=\"border-b border-primary/10\">\n                                <td class=\"px-4 py-3 font-medium\">Arrival</td>\n                                <td class=\"px-4 py-3\">“Good morning, how are you?”</td>\n                                <td class=\"px-4 py-3\">Greeting, mood check</td>\n                            </tr>\n                            <tr class=\"border-b border-primary/10\">\n                                <td class=\"px-4 py-3 font-medium\">Snack</td>\n                                <td class=\"px-4 py-3\">“Wash hands, rub rub rub”</td>\n                                <td class=\"px-4 py-3\">Hygiene &amp; fine motor</td>\n                            </tr>\n                            <tr class=\"border-b border-primary/10\">\n                                <td class=\"px-4 py-3 font-medium\">Pack Away</td>\n                                <td class=\"px-4 py-3\">“Clean up, clean up, everybody”</td>\n                                <td class=\"px-4 py-3\">Responsibility</td>\n                            </tr>\n                            <tr class=\"border-b border-primary/10\">\n                                <td class=\"px-4 py-3 font-medium\">Goodbye</td>\n                                <td class=\"px-4 py-3\">“See you later, alligator!”</td>\n                                <td class=\"px-4 py-3\">Closure &amp; memory</td>\n                            </tr>\n                        </tbody>\n                    </table>\n                </div>\n\n                <h4 class=\"font-semibold text-xl mb-3\">✅ Tips for Effective Routines</h4>\n                <ul class=\"list-disc list-inside space-y-1 text-sm text-muted-foreground ml-4\">\n                    <li>Use the **same song daily** → children feel secure and anticipate the next step.</li>\n                    <li>Integrate **short instructions** → language + routine learning.</li>\n                    <li>Encourage children to **lead parts of the routine** to build independence.</li>\n                </ul>\n\n                <div class=\"bg-primary/5 p-4 rounded-lg\">\n                    <h4 class=\"font-semibold text-lg mb-3\">🎨 Mini Activity</h4>\n                    <p class=\"text-muted-foreground\">Create a **“Routine Chart”** with pictures showing each daily step. Rotate a **“helper of the day”** to lead the class through the chart.</p>\n                </div>\n            </div>\n\n            <div class=\"space-y-6\">\n                <h2 class=\"text-2xl font-bold text-primary\">✅ Module 4 Summary</h2>\n\n                <ul class=\"list-disc list-inside space-y-2 text-sm text-muted-foreground ml-4\">\n                    <li>**Stories &amp; songs:** Language, memory, culture, emotion</li>\n                    <li>**Manipulatives:** Hands-on exploration of concepts</li>\n                    <li>**Games:** Active learning for numeracy &amp; literacy</li>\n                    <li>**Group work:** Social-emotional development, cooperative learning</li>\n                    <li>**Routines:** Teach life skills, reinforce structure and language</li>\n                </ul>\n\n                <div class=\"bg-secondary/5 p-4 rounded-lg\">\n                    <h4 class=\"font-semibold text-lg mb-3\">💬 Reflection Task</h4>\n                    <p class=\"text-muted-foreground mb-4\">Reflect on your current teaching methods:</p>\n                    <ul class=\"list-disc list-inside space-y-1 text-sm text-muted-foreground ml-4\">\n                        <li>Which one method can you commit to using **every day** this week to enhance your lesson?</li>\n                    </ul>\n                    <p class=\"mt-2 text-sm text-muted-foreground\">Write your commitment and plan in your journal (3–5 sentences).</p>\n                </div>\n            </div>\n        </div>",
        videos: [
            {
                youtubeUrl: "https://youtu.be/S8p5272L-2w",
                caption: "Storytelling Techniques for Early Childhood"
            },
            {
                youtubeUrl: "https://youtu.be/8I2gL8y8s3Y",
                caption: "Nursery Numeracy Games"
            },
            {
                youtubeUrl: "https://youtu.be/3z-y3Vp8o_4",
                caption: "The Importance of Play in Early Learning – TEDx"
            },
            {
                youtubeUrl: "https://youtu.be/j-3Qp50aW40",
                caption: "Positive Behavior Management in Early Childhood – NAEYC"
            }
        ]
    },
    sections: [
        {
            id: "n5s1",
            title: "5.1  Setting Classroom Rules for Nursery Pupils",
            html: "<div class=\"space-y-4\">\n                <p class=\"text-muted-foreground\">Effective classroom management begins with using positive language such as saying “We walk inside” instead of “Don’t run.” This encourages desired behavior rather than focusing on what not to do. Teachers can also use visual reminders like posters with pictures, emojis, or drawings to make rules more engaging and easy for children to remember. Consistency is key—repeating and reinforcing the rules daily for at least two to three weeks helps pupils internalize them and build lasting habits.</p>\n                <div class=\"bg-primary/5 p-4 rounded-lg\">\n                    <p class=\"font-semibold text-sm mb-2\">Practical Tip:</p>\n                    <p class=\"text-sm text-muted-foreground\">Encouraging participation boosts pupil engagement and ownership of classroom behavior. Allowing children to help illustrate or decorate the rules gives them a sense of pride and responsibility, making them more likely to follow them.</p>\n                </div>\n            </div>",
            youtubeUrl: "https://youtu.be/S8p5272L-2w",
            caption: "Storytelling Techniques for Early Childhood"
        },
        {
            id: "n5s2",
            title: "5.2 Encouraging Positive Behavior",
            html: "<div class=\"space-y-4\">\n                <p class=\"text-muted-foreground\">Encouraging positive behavior is essential because <strong>positive reinforcement</strong> strengthens desired actions and builds children’s confidence. Recognizing and rewarding good behavior motivates pupils to repeat it and creates a supportive classroom atmosphere. Teachers can use specific praise, such as “You put the toys away — excellent job!”, to clearly highlight what the child did well, making the feedback more meaningful and effective.</p>\n                <ul class=\"list-disc list-inside space-y-1 ml-4 text-sm text-muted-foreground\">\n                    <li>It’s important to avoid vague praise like “Good job,” which lacks clarity, and to steer away from negative focus such as “Stop doing that.” Instead, highlight positive behaviors and guide pupils gently toward improvement.</li>\n                    <li>🎨 Mini Activity: Have children design a sticker chart for one week, leaving space for them to add their own stickers to track progress and stay motivated.</li>\n                </ul>\n            </div>",
            youtubeUrl: "https://youtu.be/j-3Qp50aW40",
            caption: "The Role of Manipulatives in Early Math"
        },
        {
            id: "n5s3",
            title: "5.3 Handling Misbehavior with Patience and Care",
            html: "<div class=\"space-y-4\">\n                <p class=\"text-muted-foreground\">Handling misbehavior with patience and care begins with understanding that misbehavior is a form of communication. Children often act out because they lack the words to express their feelings or needs. Instead of reacting with frustration, tutors should aim to respond calmly and guide the child toward better choices. The Calm, Connect, Redirect approach helps achieve this by focusing on empathy, clear communication, and gentle correction.</p>\n                <div class=\"bg-primary/5 p-4 rounded-lg\">\n                    <p class=\"font-semibold text-sm mb-2\">Rule:</p>\n                    <p class=\"text-sm text-muted-foreground\">In practice, tutors can use empathy-based responses. For example, if a child throws blocks, say, “I see you’re frustrated. Let’s build together instead.” If a child refuses to share, respond with, “We use kind hands. Would you like to use the blue or green block first?” Additionally, creating a Safe Space — a cozy corner with soft toys or books — gives children a place to calm down and practice self-regulation before rejoining group activities.</p>\n                </div>\n            </div>",
            youtubeUrl: "https://youtu.be/8I2gL8y8s3Y",
            caption: "Nursery Numeracy Games"
        },
        {
            id: "n5s4",
            title: "5.4 Keeping pupils engaged and focused",
            html: "<div class=\"space-y-4\">\n                <p class=\"text-muted-foreground\">Keeping pupils engaged and focused requires understanding their attention spans, which naturally vary by age—about 3–5 minutes for age 3, 5–8 minutes for age 4, and 8–10 minutes for age 5. Since young children’s focus shifts quickly, lessons should include short, varied, and interactive activities. Using voice modulation—whispering, singing, or speaking loudly—can instantly recapture attention and make learning more dynamic and enjoyable.</p>\n <p> Examples of engaging activities include a counting song with claps to blend numeracy and motor coordination, story acting with puppets to build literacy and social skills, and an outdoor scavenger hunt that enhances problem-solving, observation, and teamwork. 🧩 Mini Activity: Prepare a Magic Bag with 3–4 objects and invite children to pick one and tell a story about it, stimulating creativity and verbal expression.</p>           </div>",
            youtubeUrl: "https://youtu.be/3z-y3Vp8o_4",
            caption: "Vygotsky's Social Learning Theory Explained"
        },
        {
            id: "n5s5",
            title: "5.5 Time Management During Short Lessons",
            html: "<div class=\"space-y-4\">\n                <p class=\"text-muted-foreground\">Effective time management ensures that short lessons remain productive, engaging, and balanced. A well-structured 20–25 minute lesson helps maintain children’s focus while covering key learning areas. Begin with 0–3 minutes of greeting and a song to build connection and energy, such as a “Good morning” circle with a name game. Move to 3–8 minutes of story or demonstration time to develop literacy and listening skills—for example, telling “Anansi and the Pot of Beans” with puppets.</p>\n  <p>From 8–18 minutes, transition into hands-on play to reinforce core skills like counting blocks or drawing shapes. This is followed by 18–22 minutes of sharing and reflection, where pupils display their work and build verbal confidence through peer learning. Finally, use 22–25 minutes for packing up and saying goodbye with a fun routine such as a “Clean up, clean up” song, promoting responsibility and closure. 🎨 Mini Activity: Have tutors create a full-day lesson timetable that includes songs, storytelling, play sessions, reflection, and daily routines to practice efficient scheduling and pacing.</p>          </div>",
            youtubeUrl: "https://www.youtube.com/watch?v=kYI4j2U_Gk8",
            caption: "Using Daily Routines to Teach Toddlers"
        }
    ],
    quiz: [
        {
            question: "Best classroom rules for nursery pupils?",
            options: [
                "Long, strict rules",
                "Simple, positive, visual ",
                "Only verbal rules",
                "No rules"
            ],
            correctAnswerIndex: 1
        },
        {
            question: "Specific praise example?",
            options: [
                "Good boy",
                "You shared the crayon — generous!",
                "Well done",
                "Silence"
            ],
            correctAnswerIndex: 1
        },
        {
            question: "Using a “talking stick” during circle time helps:",
            options: [
                "Teach counting",
                "Teach hygiene",
                "Promote social turn-taking",
                "Make children sit still"
            ],
            correctAnswerIndex: 2
        },
        {
            question: "Routine songs are important because:",
            options: [
                "They improve handwriting",
                "Build structure, security, and language",
                "They replace storytime",
                "They teach counting only"
            ],
            correctAnswerIndex: 1
        },
        {
            question: "Parallel play (playing beside others but not together) is common at what age?",
            options: [
                "3 years old",
                "4–5 years old",
                "6 years old",
                "2 years old"
            ],
            correctAnswerIndex: 0
        },
        {
            question: "Effective group size for 4–5-year-old nursery pupils is:",
            options: [
                "1–2 children",
                "3–5 children",
                "6–10 children",
                "10+ children"
            ],
            correctAnswerIndex: 1
        },
        {
            question: "Mini literacy games should ideally last:",
            options: [
                "10–15 minutes",
                "3–5 minutes",
                "20 minutes",
                "30 minutes"
            ],
            correctAnswerIndex: 1
        },
        {
            question: "Using props in storytelling helps:",
            options: [
                "Keep the tutor busy",
                "Test memory",
                "Engagement and imagination",
                "Reduce playtime"
            ],
            correctAnswerIndex: 2
        },
        {
            question: "Repetition in songs aids:",
            options: [
                "Memory and vocabulary",
                "Only social skills",
                "Only hygiene",
                "Only motor skills"
            ],
            correctAnswerIndex: 0
        },
        {
            question: "The tutor’s primary role in classroom games is to:",
            options: [
                "Watch quietly",
                "Model rules and encourage participation",
                "Correct mistakes harshly",
                "Only assign teams"
            ],
            correctAnswerIndex: 1
        },
        {
            question: "Teaching through routines primarily develops:",
            options: [
                "Literacy skills only",
                "Academic skills only",
                "Life skills and responsibility",
                "Only physical skills"
            ],
            correctAnswerIndex: 2
        },
        {
            question: "One key tip for manipulatives is to:",
            options: [
                "Give all materials at once",
                "Rotate weekly",
                "Use only digital objects",
                "Use adult-only tools"
            ],
            correctAnswerIndex: 1
        },
        {
            question: "Integration of games and learning:",
            options: [
                "Wastes time",
                "Confuses children",
                "Supports multiple learning domains",
                "Should be avoided"
            ],
            correctAnswerIndex: 2
        },
        {
            question: "Reflection after teaching helps tutors to:",
            options: [
                "Complain to colleagues",
                "Adjust and improve methods",
                "Impress supervisors",
                "Fill time"
            ],
            correctAnswerIndex: 1
        }
    ]
},
{
    id: "n6",
    title: "Assessment and Record Keeping",
    description: "Learn continuous, informal assessment methods, observation techniques, report card writing, parent communication, and strategies for supporting slow learners in nursery education.",
    content: {
        html: `<div class="space-y-10">

            <div class="space-y-6">
                <h1 class="text-3xl font-bold text-primary mb-2">Module 6: Assessment and Record Keeping</h1>
                <p class="text-muted-foreground mb-6">(Duration: ~60 minutes with exercises and examples)</p>

                <div class="bg-primary/5 border-l-4 border-primary p-4 rounded-r-lg">
                    <h3 class="font-bold text-lg mb-3 text-primary">🎯 Learning Objectives</h3>
                    <p class="text-sm mb-2">By the end of this module, tutors will be able to:</p>
                    <ul class="list-disc list-inside space-y-2 text-sm text-muted-foreground ml-4">
                        <li>Apply continuous, informal, and practical assessment methods for nursery pupils.</li>
                        <li>Use structured observation and note-taking techniques to track development.</li>
                        <li>Write detailed report cards and term evaluations that are specific and constructive.</li>
                        <li>Communicate progress to parents in positive, evidence-based ways.</li>
                        <li>Support slow learners with differentiated strategies.</li>
                        <li>Reflect on assessment data to plan next learning steps.</li>
                    </ul>
                </div>
            </div>

            <div class="space-y-6">
                <h2 class="text-2xl font-bold text-primary">6.1 Continuous and Informal Assessment Methods</h2>

                <div class="bg-secondary/5 p-4 rounded-lg">
                    <h4 class="font-semibold text-lg mb-3">🔍 Principle</h4>
                    <p class="text-muted-foreground mb-4">
                        Nursery pupils cannot be assessed with tests; they are evaluated through observation, interaction, and participation.
                    </p>
                </div>

                <h4 class="font-semibold text-xl mb-3">📋 Methods</h4>
                <div class="relative overflow-x-auto shadow-sm rounded-lg">
                    <table class="w-full text-sm">
                        <thead class="bg-primary/5">
                            <tr>
                                <th class="px-4 py-3 text-left font-semibold">Method</th>
                                <th class="px-4 py-3 text-left font-semibold">Description</th>
                                <th class="px-4 py-3 text-left font-semibold">Example</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr class="border-b border-primary/10">
                                <td class="px-4 py-3 font-medium">Observation</td>
                                <td class="px-4 py-3">Track milestones like motor skills, language, and social behavior</td>
                                <td class="px-4 py-3">Watch child during play</td>
                            </tr>
                            <tr class="border-b border-primary/10">
                                <td class="px-4 py-3 font-medium">Photos/Videos</td>
                                <td class="px-4 py-3">Document activities like cutting, stacking blocks, or role-play</td>
                                <td class="px-4 py-3">Record block tower building</td>
                            </tr>
                            <tr class="border-b border-primary/10">
                                <td class="px-4 py-3 font-medium">Work Samples</td>
                                <td class="px-4 py-3">Collect drawings, paintings, or collages</td>
                                <td class="px-4 py-3">Keep portfolio of artwork</td>
                            </tr>
                            <tr class="border-b border-primary/10">
                                <td class="px-4 py-3 font-medium">Checklists</td>
                                <td class="px-4 py-3">Track progress for specific skills</td>
                                <td class="px-4 py-3">Counts 1–5, holds crayon properly</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div class="bg-primary/5 p-4 rounded-lg mt-6">
                    <h4 class="font-semibold text-lg mb-3">⏰ Frequency</h4>
                    <ul class="list-disc list-inside space-y-2 text-sm text-muted-foreground ml-4">
                        <li>Daily notes for unusual behavior</li>
                        <li>One focused observation per child per week</li>
                    </ul>
                </div>

                <div class="bg-secondary/5 p-4 rounded-lg mt-6">
                    <h4 class="font-semibold text-lg mb-3">🧩 Mini Activity 1</h4>
                    <p class="text-muted-foreground mb-2">Observe a child building a block tower. Record:</p>
                    <ul class="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-4">
                        <li>How many blocks they used</li>
                        <li>Any words they said</li>
                        <li>Interactions with peers</li>
                    </ul>
                </div>

                <div class="bg-secondary/5 p-4 rounded-lg mt-4">
                    <h4 class="font-semibold text-lg mb-3">🧩 Mini Activity 2</h4>
                    <p class="text-muted-foreground">Take 2 photos during a sensory activity. Write 1 learning outcome from each photo.</p>
                </div>
            </div>

            <div class="space-y-6">
                <h2 class="text-2xl font-bold text-primary">6.2 Observation and Note-taking Techniques</h2>

                <div class="bg-secondary/5 p-4 rounded-lg">
                    <h4 class="font-semibold text-lg mb-3">📝 Anecdotal Records</h4>
                    <p class="text-muted-foreground mb-4">
                        Short, objective descriptions of what the child did and said.
                    </p>
                </div>

                <div class="bg-primary/5 p-4 rounded-lg">
                    <h4 class="font-semibold text-lg mb-3">Example</h4>
                    <div class="bg-white/80 p-4 rounded border-l-4 border-primary">
                        <p class="text-sm font-semibold mb-2">Date: 01/11/25 | Child: Tiku | Activity: Block play</p>
                        <p class="text-sm text-muted-foreground">Observation: Tiku stacked 6 blocks, said "Look, tall tower!" Then helped Awa when hers fell.</p>
                    </div>
                </div>

                <h4 class="font-semibold text-xl mb-3">✅ Effective Note-Taking Tips</h4>
                <ul class="list-disc list-inside space-y-2 text-sm text-muted-foreground ml-4">
                    <li>Avoid subjective words (e.g., "lazy," "naughty")</li>
                    <li>Include time, activity, behavior, and context</li>
                    <li>Observe trends over 2–3 weeks</li>
                    <li>Use digital tools like the Prepskul Tutor Portal for efficiency</li>
                </ul>

                <div class="bg-secondary/5 p-4 rounded-lg mt-6">
                    <h4 class="font-semibold text-lg mb-3">🧩 Mini Exercise</h4>
                    <p class="text-muted-foreground">Observe 2 children during a play activity. Record one social skill, one cognitive skill, and one motor skill for each child.</p>
                </div>
            </div>

            <div class="space-y-6">
                <h2 class="text-2xl font-bold text-primary">6.3 Report Card Writing and Termly Evaluation</h2>

                <div class="bg-secondary/5 p-4 rounded-lg">
                    <h4 class="font-semibold text-lg mb-3">📋 Structure of a Nursery Report Card (Cameroon)</h4>
                    <ul class="list-disc list-inside space-y-2 text-sm text-muted-foreground ml-4">
                        <li><strong>Levels:</strong> Excellent, Good, Fair, Needs Support</li>
                        <li>Include specific, positive comments</li>
                        <li>Avoid peer comparisons</li>
                        <li>Include actionable tips</li>
                    </ul>
                </div>

                <h4 class="font-semibold text-xl mb-3">📝 Sample Comments</h4>
                <div class="relative overflow-x-auto shadow-sm rounded-lg">
                    <table class="w-full text-sm">
                        <thead class="bg-primary/5">
                            <tr>
                                <th class="px-4 py-3 text-left font-semibold">Area</th>
                                <th class="px-4 py-3 text-left font-semibold">Sample Comment</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr class="border-b border-primary/10">
                                <td class="px-4 py-3 font-medium">Language</td>
                                <td class="px-4 py-3">"Speaks in full sentences; enjoys storytelling and asking questions."</td>
                            </tr>
                            <tr class="border-b border-primary/10">
                                <td class="px-4 py-3 font-medium">Social Skills</td>
                                <td class="px-4 py-3">"Shares toys with reminders; shows empathy during play."</td>
                            </tr>
                            <tr class="border-b border-primary/10">
                                <td class="px-4 py-3 font-medium">Motor Skills</td>
                                <td class="px-4 py-3">"Holds crayon correctly and can cut along straight lines."</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div class="bg-secondary/5 p-4 rounded-lg mt-6">
                    <h4 class="font-semibold text-lg mb-3">🧩 Mini Exercise</h4>
                    <p class="text-muted-foreground">Write a comment for a child who learned to count to 10 and recognize basic shapes.</p>
                </div>
            </div>

            <div class="space-y-6">
                <h2 class="text-2xl font-bold text-primary">6.4 Communicating Progress to Parents</h2>

                <div class="bg-secondary/5 p-4 rounded-lg">
                    <h4 class="font-semibold text-lg mb-3">🔑 Key Principles</h4>
                    <ul class="list-disc list-inside space-y-2 text-sm text-muted-foreground ml-4">
                        <li>Start with positive observation → builds trust</li>
                        <li>Show evidence: photos, videos, work samples</li>
                        <li>Set one clear goal per update</li>
                        <li>Use simple language</li>
                    </ul>
                </div>

                <div class="bg-primary/5 p-4 rounded-lg mt-6">
                    <h4 class="font-semibold text-lg mb-3">💬 Example of WhatsApp Update</h4>
                    <div class="bg-white/80 p-4 rounded border-l-4 border-primary">
                        <p class="text-sm text-muted-foreground italic">"Today Tiku counted to 5 independently during playtime. Practicing at home will help reinforce this skill."</p>
                    </div>
                </div>

                <h4 class="font-semibold text-xl mb-3">✅ Parent Communication Tips</h4>
                <ul class="list-disc list-inside space-y-2 text-sm text-muted-foreground ml-4">
                    <li>Listen actively to concerns</li>
                    <li>Celebrate small wins, not just academic achievements</li>
                    <li>Include photos/videos if parents consent</li>
                </ul>

                <div class="bg-secondary/5 p-4 rounded-lg mt-6">
                    <h4 class="font-semibold text-lg mb-3">🧩 Mini Exercise</h4>
                    <p class="text-muted-foreground">Draft 3 sample WhatsApp updates for different activities: counting, coloring, and cooperative play.</p>
                </div>
            </div>

            <div class="space-y-6">
                <h2 class="text-2xl font-bold text-primary">6.5 Supporting Slow Learners</h2>

                <div class="bg-secondary/5 p-4 rounded-lg">
                    <h4 class="font-semibold text-lg mb-3">🎯 Strategies</h4>
                    <ul class="list-disc list-inside space-y-2 text-sm text-muted-foreground ml-4">
                        <li><strong>Extra time:</strong> Let the child complete tasks at their pace</li>
                        <li><strong>Peer buddy system:</strong> Pair with confident peers</li>
                        <li><strong>Simplify tasks:</strong> Use fewer objects or steps</li>
                        <li><strong>Celebrate small wins:</strong> "You matched 2 colors — bravo!"</li>
                    </ul>
                </div>

                <div class="bg-primary/5 p-4 rounded-lg mt-6">
                    <h4 class="font-semibold text-lg mb-3">💡 Principle</h4>
                    <ul class="list-disc list-inside space-y-2 text-sm text-muted-foreground ml-4">
                        <li>Do not compare to peers → focus on personal growth</li>
                        <li>Track progress in anecdotal records and checklists</li>
                        <li>Adjust future activities based on assessment</li>
                    </ul>
                </div>

                <div class="bg-secondary/5 p-4 rounded-lg mt-6">
                    <h4 class="font-semibold text-lg mb-3">🧩 Mini Exercise</h4>
                    <p class="text-muted-foreground mb-2">Create a differentiated activity plan for slow learners in counting or color recognition. Include:</p>
                    <ul class="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-4">
                        <li>Task</li>
                        <li>Simplification</li>
                        <li>Peer support</li>
                        <li>Reward/celebration</li>
                    </ul>
                </div>
            </div>

            <div class="space-y-6">
                <h2 class="text-2xl font-bold text-primary">✅ Module 6 Summary</h2>

                <ul class="list-disc list-inside space-y-2 text-sm text-muted-foreground ml-4">
                    <li><strong>Assessment</strong> is continuous, informal, and evidence-based</li>
                    <li><strong>Observation and note-taking</strong> → objective and patterned</li>
                    <li><strong>Report cards</strong> → positive, specific, actionable</li>
                    <li><strong>Communicate progress</strong> → evidence + 1 clear goal</li>
                    <li><strong>Support slow learners</strong> → extra time, peer help, simplified tasks, celebration</li>
                    <li><strong>Reflection</strong> → plan next steps based on observed patterns</li>
                </ul>

                <div class="bg-secondary/5 p-4 rounded-lg">
                    <h4 class="font-semibold text-lg mb-3">💬 Reflection Task</h4>
                    <p class="text-muted-foreground mb-4">Which assessment method will you implement tomorrow, and how will you record the outcome?</p>
                    <p class="text-sm text-muted-foreground">Write your reflection in your journal (3–5 sentences).</p>
                </div>
            </div>
        </div>`,
        videos: [
            {
                youtubeUrl: "https://www.youtube.com/watch?v=early-childhood-assessment",
                caption: "Early Childhood Assessment Techniques — real classroom examples of informal assessment"
            },
            {
                youtubeUrl: "https://www.youtube.com/watch?v=observation-record-keeping",
                caption: "Observation and Record-Keeping in Nursery — examples of good anecdotal note-taking"
            },
            {
                youtubeUrl: "https://www.youtube.com/watch?v=effective-reports",
                caption: "Writing Effective Early Childhood Reports — practical examples"
            },
            {
                youtubeUrl: "https://www.youtube.com/watch?v=parent-communication",
                caption: "Communicating with Parents Effectively — practical strategies for daily updates"
            },
            {
                youtubeUrl: "https://www.youtube.com/watch?v=slow-learners",
                caption: "Supporting Slow Learners in Early Childhood"
            }
        ]
    },
    sections: [
        {
            id: "n6s1",
            title: "6.1 Continuous and Informal Assessment Methods",
            html: `<div class="space-y-4">
                <p class="text-muted-foreground">Nursery pupils cannot be assessed with tests; they are evaluated through observation, interaction, and participation. Methods include observation (tracking milestones), photos/videos (documenting activities), work samples (collecting drawings/paintings), and checklists (tracking specific skills). Frequency: daily notes for unusual behavior; one focused observation per child per week.</p>
                <div class="bg-primary/5 p-4 rounded-lg">
                    <p class="font-semibold text-sm mb-2">Practical Tip:</p>
                    <p class="text-sm text-muted-foreground">Use photos and videos to document learning moments. Always get parent consent before sharing images.</p>
                </div>
            </div>`,
            youtubeUrl: "https://www.youtube.com/watch?v=early-childhood-assessment",
            caption: "Early Childhood Assessment Techniques — real classroom examples of informal assessment"
        },
        {
            id: "n6s2",
            title: "6.2 Observation and Note-taking Techniques",
            html: `<div class="space-y-4">
                <p class="text-muted-foreground">Anecdotal records are short, objective descriptions of what the child did and said. Effective note-taking includes: avoiding subjective words, including time/activity/behavior/context, observing trends over 2–3 weeks, and using digital tools for efficiency.</p>
                <div class="bg-primary/5 p-4 rounded-lg">
                    <p class="font-semibold text-sm mb-2">Example:</p>
                    <p class="text-sm text-muted-foreground italic">Date: 01/11/25 | Child: Tiku | Activity: Block play<br/>Observation: Tiku stacked 6 blocks, said "Look, tall tower!" Then helped Awa when hers fell.</p>
                </div>
            </div>`,
            youtubeUrl: "https://www.youtube.com/watch?v=observation-record-keeping",
            caption: "Observation and Record-Keeping in Nursery — examples of good anecdotal note-taking"
        },
        {
            id: "n6s3",
            title: "6.3 Report Card Writing and Termly Evaluation",
            html: `<div class="space-y-4">
                <p class="text-muted-foreground">Nursery report cards use levels: Excellent, Good, Fair, Needs Support. Include specific, positive comments; avoid peer comparisons; include actionable tips. Sample: "Speaks in full sentences; enjoys storytelling and asking questions."</p>
            </div>`,
            youtubeUrl: "https://www.youtube.com/watch?v=effective-reports",
            caption: "Writing Effective Early Childhood Reports — practical examples"
        },
        {
            id: "n6s4",
            title: "6.4 Communicating Progress to Parents",
            html: `<div class="space-y-4">
                <p class="text-muted-foreground">Key principles: start with positive observation, show evidence (photos/videos/work samples), set one clear goal per update, use simple language. Example WhatsApp update: "Today Tiku counted to 5 independently during playtime. Practicing at home will help reinforce this skill."</p>
            </div>`,
            youtubeUrl: "https://www.youtube.com/watch?v=parent-communication",
            caption: "Communicating with Parents Effectively — practical strategies for daily updates"
        },
        {
            id: "n6s5",
            title: "6.5 Supporting Slow Learners",
            html: `<div class="space-y-4">
                <p class="text-muted-foreground">Strategies include: extra time (let child complete tasks at their pace), peer buddy system (pair with confident peers), simplify tasks (use fewer objects or steps), celebrate small wins. Principle: do not compare to peers → focus on personal growth. Track progress in anecdotal records and adjust future activities based on assessment.</p>
            </div>`,
            youtubeUrl: "https://www.youtube.com/watch?v=slow-learners",
            caption: "Supporting Slow Learners in Early Childhood"
        }
    ],
    quiz: [
        {
            question: "Best way to assess nursery pupils?",
            options: [
                "Written tests",
                "Observation and informal assessment",
                "Only group exams",
                "Oral quizzes"
            ],
            correctAnswerIndex: 1
        },
        {
            question: "Anecdotal records should be:",
            options: [
                "Subjective comments",
                "Factual, short descriptions",
                "Report card grades",
                "Worksheets"
            ],
            correctAnswerIndex: 1
        },
        {
            question: "Observation frequency:",
            options: [
                "Once per term",
                "One focused observation per week",
                "Only at start of year",
                "Every 5 minutes"
            ],
            correctAnswerIndex: 1
        },
        {
            question: "Effective note-taking tip:",
            options: [
                "Include personal judgments",
                "Be objective; note time and context",
                "Only record positive behavior",
                "Skip patterns"
            ],
            correctAnswerIndex: 1
        },
        {
            question: "Nursery report card levels:",
            options: [
                "Excellent, Good, Fair, Needs Support",
                "A, B, C, D",
                "Pass/Fail",
                "Beginner, Intermediate, Advanced"
            ],
            correctAnswerIndex: 0
        },
        {
            question: "Specific report comment example:",
            options: [
                "Tiku did well",
                "Tiku counts to 5 and shares crayons with friends",
                "Tiku is okay",
                "Good job"
            ],
            correctAnswerIndex: 1
        },
        {
            question: "Parent communication frequency:",
            options: [
                "Only termly",
                "Daily updates with evidence",
                "Monthly verbally",
                "Not necessary"
            ],
            correctAnswerIndex: 1
        },
        {
            question: "Supporting slow learners includes:",
            options: [
                "Compare with peers",
                "Extra time, peer buddy, simplified tasks",
                "Ignore mistakes",
                "Punish mistakes"
            ],
            correctAnswerIndex: 1
        },
        {
            question: "Celebrating small wins helps:",
            options: [
                "Boost confidence",
                "Only for fast learners",
                "Reduce play",
                "Take more teacher time"
            ],
            correctAnswerIndex: 0
        },
        {
            question: "Observation patterns should be noted over:",
            options: [
                "1 day",
                "2–3 weeks",
                "Only during play",
                "Not necessary"
            ],
            correctAnswerIndex: 1
        },
        {
            question: "WhatsApp updates should include:",
            options: [
                "Long paragraphs",
                "Evidence + one goal",
                "Only grades",
                "Complaints"
            ],
            correctAnswerIndex: 1
        },
        {
            question: "Photos/videos of pupils:",
            options: [
                "Can be shared publicly",
                "Require parent consent",
                "Only emailed",
                "Optional"
            ],
            correctAnswerIndex: 1
        },
        {
            question: "Assessment in nursery is:",
            options: [
                "Competitive",
                "Continuous, developmental",
                "Exam-based",
                "Optional"
            ],
            correctAnswerIndex: 1
        },
        {
            question: "Checklists track:",
            options: [
                "Advanced academic skills",
                "Age-appropriate skills",
                "Only behavior",
                "Peer comparison"
            ],
            correctAnswerIndex: 1
        },
        {
            question: "Key principle supporting slow learners:",
            options: [
                "Compare to peers",
                "Compare to own past progress",
                "Rush to next level",
                "Avoid challenges"
            ],
            correctAnswerIndex: 1
        }
    ]
},
{
    id: "n7",
    title: "Tutor Ethics, Professionalism & Collaboration",
    description: "Learn ethical principles for working with young children, professional communication strategies, team teaching collaboration, building trust, and reflective practice for continuous improvement.",
    content: {
        html: `<div class="space-y-10">

            <div class="space-y-6">
                <h1 class="text-3xl font-bold text-primary mb-2">Module 7: Tutor Ethics, Professionalism & Collaboration</h1>
                <p class="text-muted-foreground mb-6">(Duration: ~60+ minutes)</p>

                <div class="bg-primary/5 border-l-4 border-primary p-4 rounded-r-lg">
                    <h3 class="font-bold text-lg mb-3 text-primary">🎯 Learning Objectives</h3>
                    <p class="text-sm mb-2">By the end of this module, tutors will be able to:</p>
                    <ul class="list-disc list-inside space-y-2 text-sm text-muted-foreground ml-4">
                        <li>Apply ethical principles in real-life nursery scenarios.</li>
                        <li>Communicate professionally with parents, colleagues, and pupils.</li>
                        <li>Collaborate effectively in team teaching and classroom management.</li>
                        <li>Build trust and confidence with children and parents.</li>
                        <li>Engage in reflective practice to enhance teaching skills continuously.</li>
                        <li>Handle ethical dilemmas and unexpected classroom situations responsibly.</li>
                    </ul>
                </div>
            </div>

            <div class="space-y-6">
                <h2 class="text-2xl font-bold text-primary">7.1 Ethics of Working with Young Children</h2>

                <div class="bg-secondary/5 p-4 rounded-lg">
                    <h4 class="font-semibold text-lg mb-3">🔑 Key Principles</h4>
                    <ul class="list-disc list-inside space-y-2 text-sm text-muted-foreground ml-4">
                        <li><strong>Child Safety:</strong> Never leave children unsupervised; monitor outdoor and indoor activities.</li>
                        <li><strong>Confidentiality:</strong> Respect privacy of child records and discussions.</li>
                        <li><strong>Positive Guidance:</strong> Use encouragement, redirection, and calm communication instead of punishment.</li>
                        <li><strong>Cultural Sensitivity:</strong> Respect local traditions, names, meals, and family norms.</li>
                    </ul>
                </div>

                <h4 class="font-semibold text-xl mb-3">📝 Practical Examples</h4>
                <div class="space-y-3">
                    <div class="bg-primary/5 p-4 rounded-lg">
                        <p class="text-sm font-semibold mb-2">Scenario 1:</p>
                        <p class="text-sm text-muted-foreground">Child falls during play → calmly assist and guide, do not scold.</p>
                    </div>
                    <div class="bg-primary/5 p-4 rounded-lg">
                        <p class="text-sm font-semibold mb-2">Scenario 2:</p>
                        <p class="text-sm text-muted-foreground">Parent asks about another child → respond: "I cannot share private information, but let's focus on your child's progress."</p>
                    </div>
                </div>

                <div class="bg-secondary/5 p-4 rounded-lg mt-6">
                    <h4 class="font-semibold text-lg mb-3">🧩 Interactive Exercise</h4>
                    <p class="text-muted-foreground">Create a "safety checklist" for outdoor and indoor play. Include 5 items for each.</p>
                </div>
            </div>

            <div class="space-y-6">
                <h2 class="text-2xl font-bold text-primary">7.2 Professional Communication</h2>

                <div class="bg-secondary/5 p-4 rounded-lg">
                    <h4 class="font-semibold text-lg mb-3">💬 Communication Guidelines</h4>
                    <div class="relative overflow-x-auto shadow-sm rounded-lg mt-4">
                        <table class="w-full text-sm">
                            <thead class="bg-primary/5">
                                <tr>
                                    <th class="px-4 py-3 text-left font-semibold">Audience</th>
                                    <th class="px-4 py-3 text-left font-semibold">Guidelines</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr class="border-b border-primary/10">
                                    <td class="px-4 py-3 font-medium">Parents</td>
                                    <td class="px-4 py-3">Use evidence-based updates, focus on strengths, include one actionable goal</td>
                                </tr>
                                <tr class="border-b border-primary/10">
                                    <td class="px-4 py-3 font-medium">Colleagues</td>
                                    <td class="px-4 py-3">Share teaching strategies, offer constructive feedback, avoid gossip</td>
                                </tr>
                                <tr class="border-b border-primary/10">
                                    <td class="px-4 py-3 font-medium">Children</td>
                                    <td class="px-4 py-3">Speak clearly, slowly, positively; use names and gestures</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <h4 class="font-semibold text-xl mb-3">📝 Examples</h4>
                <div class="space-y-3">
                    <div class="bg-primary/5 p-4 rounded-lg">
                        <p class="text-sm font-semibold mb-2">Parent Meeting:</p>
                        <p class="text-sm text-muted-foreground italic">"Tiku enjoys block play. Encouraging him to count blocks at home will reinforce this skill."</p>
                    </div>
                    <div class="bg-primary/5 p-4 rounded-lg">
                        <p class="text-sm font-semibold mb-2">Colleague:</p>
                        <p class="text-sm text-muted-foreground italic">"Let's plan a rotation activity tomorrow—one leads story, the other supervises materials."</p>
                    </div>
                </div>

                <div class="bg-secondary/5 p-4 rounded-lg mt-6">
                    <h4 class="font-semibold text-lg mb-3">🎭 Role-Play Activity</h4>
                    <p class="text-muted-foreground">Pair with a colleague and simulate a parent-teacher meeting. Deliver a progress update + next goal in 2–3 sentences. Switch roles and reflect.</p>
                </div>
            </div>

            <div class="space-y-6">
                <h2 class="text-2xl font-bold text-primary">7.3 Collaboration and Team Teaching</h2>

                <div class="bg-secondary/5 p-4 rounded-lg">
                    <h4 class="font-semibold text-lg mb-3">✨ Benefits</h4>
                    <ul class="list-disc list-inside space-y-2 text-sm text-muted-foreground ml-4">
                        <li>Efficient classroom management</li>
                        <li>Enhanced peer modeling for children</li>
                        <li>Professional growth through shared ideas</li>
                    </ul>
                </div>

                <h4 class="font-semibold text-xl mb-3">👥 Team Teaching Strategies</h4>
                <ul class="list-disc list-inside space-y-2 text-sm text-muted-foreground ml-4">
                    <li>Assign specific roles: storyteller, observer, activity supervisor</li>
                    <li>Rotate responsibilities weekly for skills development</li>
                    <li>Plan cooperative activities such as art + drama</li>
                </ul>

                <h4 class="font-semibold text-xl mb-3 mt-6">📝 Examples</h4>
                <div class="space-y-3">
                    <div class="bg-primary/5 p-4 rounded-lg">
                        <p class="text-sm font-semibold mb-2">Example 1:</p>
                        <p class="text-sm text-muted-foreground">Tutor A reads a story; Tutor B prepares art materials and guides children in drawing.</p>
                    </div>
                    <div class="bg-primary/5 p-4 rounded-lg">
                        <p class="text-sm font-semibold mb-2">Example 2:</p>
                        <p class="text-sm text-muted-foreground">Tutor A observes while Tutor B demonstrates a math activity.</p>
                    </div>
                </div>

                <div class="bg-secondary/5 p-4 rounded-lg mt-6">
                    <h4 class="font-semibold text-lg mb-3">🧩 Mini-Challenge</h4>
                    <p class="text-muted-foreground">Design a 30-minute cooperative activity for Nursery 3 pupils combining literacy and creative arts. Assign roles for each tutor.</p>
                </div>
            </div>

            <div class="space-y-6">
                <h2 class="text-2xl font-bold text-primary">7.4 Building Trust and Confidence</h2>

                <div class="bg-secondary/5 p-4 rounded-lg">
                    <h4 class="font-semibold text-lg mb-3">👩‍🏫 For Tutors</h4>
                    <ul class="list-disc list-inside space-y-2 text-sm text-muted-foreground ml-4">
                        <li>Practice lessons in front of mirror or record to improve confidence</li>
                        <li>Prepare materials and backup plans</li>
                    </ul>
                </div>

                <div class="bg-secondary/5 p-4 rounded-lg mt-4">
                    <h4 class="font-semibold text-lg mb-3">👶 For Children</h4>
                    <ul class="list-disc list-inside space-y-2 text-sm text-muted-foreground ml-4">
                        <li>Keep promises (e.g., "Story after snack")</li>
                        <li>Use consistent routines and familiar language</li>
                        <li>Validate feelings ("I see you're frustrated; let's try together")</li>
                    </ul>
                </div>

                <h4 class="font-semibold text-xl mb-3 mt-6">📝 Scenarios</h4>
                <div class="space-y-3">
                    <div class="bg-primary/5 p-4 rounded-lg">
                        <p class="text-sm font-semibold mb-2">Scenario 1:</p>
                        <p class="text-sm text-muted-foreground">Child refuses to participate → sit beside them, model the activity, encourage small steps.</p>
                    </div>
                    <div class="bg-primary/5 p-4 rounded-lg">
                        <p class="text-sm font-semibold mb-2">Scenario 2:</p>
                        <p class="text-sm text-muted-foreground">Child spills paint → calmly help clean and continue activity without scolding.</p>
                    </div>
                </div>

                <div class="bg-secondary/5 p-4 rounded-lg mt-6">
                    <h4 class="font-semibold text-lg mb-3">🧩 Mini Exercise</h4>
                    <p class="text-muted-foreground">List 5 ways you can build trust with a new nursery class on your first day.</p>
                </div>
            </div>

            <div class="space-y-6">
                <h2 class="text-2xl font-bold text-primary">7.5 Reflective Practice</h2>

                <div class="bg-secondary/5 p-4 rounded-lg">
                    <h4 class="font-semibold text-lg mb-3">🎯 Purpose</h4>
                    <ul class="list-disc list-inside space-y-2 text-sm text-muted-foreground ml-4">
                        <li>Identify strengths and areas for improvement</li>
                        <li>Promote continuous professional growth</li>
                        <li>Encourage a growth mindset</li>
                    </ul>
                </div>

                <h4 class="font-semibold text-xl mb-3 mt-6">🛠️ Tools for Reflection</h4>
                <div class="relative overflow-x-auto shadow-sm rounded-lg">
                    <table class="w-full text-sm">
                        <thead class="bg-primary/5">
                            <tr>
                                <th class="px-4 py-3 text-left font-semibold">Tool</th>
                                <th class="px-4 py-3 text-left font-semibold">Description</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr class="border-b border-primary/10">
                                <td class="px-4 py-3 font-medium">Weekly Journal</td>
                                <td class="px-4 py-3">What went well? What to improve? One new strategy to try</td>
                            </tr>
                            <tr class="border-b border-primary/10">
                                <td class="px-4 py-3 font-medium">Mentor Consultation</td>
                                <td class="px-4 py-3">Seek feedback from senior tutors</td>
                            </tr>
                            <tr class="border-b border-primary/10">
                                <td class="px-4 py-3 font-medium">Video Review</td>
                                <td class="px-4 py-3">Watch your own lesson to identify patterns or gaps</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div class="bg-primary/5 p-4 rounded-lg mt-6">
                    <h4 class="font-semibold text-lg mb-3">📝 Scenario</h4>
                    <p class="text-sm text-muted-foreground">Lesson on counting → some children struggled. Reflection: plan extra visual aids and peer support next session.</p>
                </div>

                <div class="bg-secondary/5 p-4 rounded-lg mt-6">
                    <h4 class="font-semibold text-lg mb-3">🧩 Mini Activity</h4>
                    <p class="text-muted-foreground mb-2">Write a reflection entry for this week's lesson:</p>
                    <ul class="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-4">
                        <li>Success</li>
                        <li>Challenge</li>
                        <li>New strategy to try next week</li>
                    </ul>
                </div>
            </div>

            <div class="space-y-6">
                <h2 class="text-2xl font-bold text-primary">✅ Module 7 Summary</h2>

                <ul class="list-disc list-inside space-y-2 text-sm text-muted-foreground ml-4">
                    <li><strong>Ethics:</strong> Safety, confidentiality, respect for culture</li>
                    <li><strong>Professional Communication:</strong> Clear, respectful, evidence-based updates</li>
                    <li><strong>Collaboration:</strong> Assign roles, share workload, plan cooperative activities</li>
                    <li><strong>Trust & Confidence:</strong> Consistency, promises, validation, and preparation</li>
                    <li><strong>Reflective Practice:</strong> Journals, mentor feedback, self-assessment, growth mindset</li>
                </ul>

                <div class="bg-secondary/5 p-4 rounded-lg">
                    <h4 class="font-semibold text-lg mb-3">💬 Reflection Question</h4>
                    <p class="text-muted-foreground mb-4">Which three ethical practices will you implement consistently this week in your nursery classroom?</p>
                    <p class="text-sm text-muted-foreground">Write your reflection in your journal (3–5 sentences).</p>
                </div>
            </div>
        </div>`,
        videos: [
            {
                youtubeUrl: "https://www.youtube.com/watch?v=ethics-early-childhood",
                caption: "Ethics in Early Childhood Education"
            },
            {
                youtubeUrl: "https://www.youtube.com/watch?v=professional-communication",
                caption: "Professional Communication in Early Childhood"
            },
            {
                youtubeUrl: "https://www.youtube.com/watch?v=collaborative-teaching",
                caption: "Collaborative Teaching in Early Childhood"
            },
            {
                youtubeUrl: "https://www.youtube.com/watch?v=building-trust-children",
                caption: "Building Trust with Young Children"
            },
            {
                youtubeUrl: "https://www.youtube.com/watch?v=reflective-practice",
                caption: "Reflective Practice in Early Childhood Education"
            }
        ]
    },
    sections: [
        {
            id: "n7s1",
            title: "7.1 Ethics of Working with Young Children",
            html: `<div class="space-y-4">
                <p class="text-muted-foreground">Key principles include: Child Safety (never leave children unsupervised), Confidentiality (respect privacy of child records), Positive Guidance (use encouragement instead of punishment), and Cultural Sensitivity (respect local traditions, names, meals, and family norms).</p>
                <div class="bg-primary/5 p-4 rounded-lg">
                    <p class="font-semibold text-sm mb-2">Practical Example:</p>
                    <p class="text-sm text-muted-foreground">Child falls during play → calmly assist and guide, do not scold. Parent asks about another child → respond: "I cannot share private information, but let's focus on your child's progress."</p>
                </div>
            </div>`,
            youtubeUrl: "https://www.youtube.com/watch?v=ethics-early-childhood",
            caption: "Ethics in Early Childhood Education"
        },
        {
            id: "n7s2",
            title: "7.2 Professional Communication",
            html: `<div class="space-y-4">
                <p class="text-muted-foreground">Communication guidelines: Parents (evidence-based updates, focus on strengths, include one actionable goal), Colleagues (share teaching strategies, offer constructive feedback, avoid gossip), Children (speak clearly, slowly, positively; use names and gestures).</p>
                <div class="bg-primary/5 p-4 rounded-lg">
                    <p class="font-semibold text-sm mb-2">Example:</p>
                    <p class="text-sm text-muted-foreground italic">Parent Meeting: "Tiku enjoys block play. Encouraging him to count blocks at home will reinforce this skill."</p>
                </div>
            </div>`,
            youtubeUrl: "https://www.youtube.com/watch?v=professional-communication",
            caption: "Professional Communication in Early Childhood"
        },
        {
            id: "n7s3",
            title: "7.3 Collaboration and Team Teaching",
            html: `<div class="space-y-4">
                <p class="text-muted-foreground">Benefits include efficient classroom management, enhanced peer modeling for children, and professional growth through shared ideas. Team teaching strategies: assign specific roles (storyteller, observer, activity supervisor), rotate responsibilities weekly, plan cooperative activities.</p>
                <div class="bg-primary/5 p-4 rounded-lg">
                    <p class="font-semibold text-sm mb-2">Example:</p>
                    <p class="text-sm text-muted-foreground">Tutor A reads a story; Tutor B prepares art materials and guides children in drawing.</p>
                </div>
            </div>`,
            youtubeUrl: "https://www.youtube.com/watch?v=collaborative-teaching",
            caption: "Collaborative Teaching in Early Childhood"
        },
        {
            id: "n7s4",
            title: "7.4 Building Trust and Confidence",
            html: `<div class="space-y-4">
                <p class="text-muted-foreground">For tutors: practice lessons in front of mirror or record to improve confidence, prepare materials and backup plans. For children: keep promises, use consistent routines and familiar language, validate feelings. Example: Child refuses to participate → sit beside them, model the activity, encourage small steps.</p>
            </div>`,
            youtubeUrl: "https://www.youtube.com/watch?v=building-trust-children",
            caption: "Building Trust with Young Children"
        },
        {
            id: "n7s5",
            title: "7.5 Reflective Practice",
            html: `<div class="space-y-4">
                <p class="text-muted-foreground">Purpose: identify strengths and areas for improvement, promote continuous professional growth, encourage a growth mindset. Tools include weekly journal (what went well, what to improve, one new strategy), mentor consultation, and video review. Example: Lesson on counting → some children struggled. Reflection: plan extra visual aids and peer support next session.</p>
            </div>`,
            youtubeUrl: "https://www.youtube.com/watch?v=reflective-practice",
            caption: "Reflective Practice in Early Childhood Education"
        }
    ],
    quiz: [
        {
            question: "First principle in early childhood ethics?",
            options: [
                "Safety first",
                "Homework first",
                "Academic results",
                "Public shaming"
            ],
            correctAnswerIndex: 0
        },
        {
            question: "Confidentiality means:",
            options: [
                "Share child info freely",
                "Keep child info private",
                "Report peers' mistakes",
                "Post photos online"
            ],
            correctAnswerIndex: 1
        },
        {
            question: "Professional communication with parents should be:",
            options: [
                "Positive, collaborative, evidence-based",
                "Critical and harsh",
                "Vague",
                "Avoided"
            ],
            correctAnswerIndex: 0
        },
        {
            question: "Team teaching benefits include:",
            options: [
                "Share workload",
                "Confuse children",
                "Replace independent teaching",
                "Avoid collaboration"
            ],
            correctAnswerIndex: 0
        },
        {
            question: "Tutor role in team teaching:",
            options: [
                "Always lead",
                "Assign clear roles",
                "Ignore colleague ideas",
                "Only observe"
            ],
            correctAnswerIndex: 1
        },
        {
            question: "Building trust with children involves:",
            options: [
                "Smiling, using names, keeping promises",
                "Scolding frequently",
                "Ignoring shy children",
                "Comparing children"
            ],
            correctAnswerIndex: 0
        },
        {
            question: "Reflective practice helps tutors:",
            options: [
                "Punish children",
                "Identify strengths and areas to improve",
                "Avoid planning",
                "Replace mentoring"
            ],
            correctAnswerIndex: 1
        },
        {
            question: "Mentor discussions in reflective practice:",
            options: [
                "Waste time",
                "Help gain advice and feedback",
                "Replace teaching",
                "Are optional"
            ],
            correctAnswerIndex: 1
        },
        {
            question: "Growth mindset phrase for children:",
            options: [
                "I can't do it",
                "Not yet",
                "Never",
                "Leave it"
            ],
            correctAnswerIndex: 1
        },
        {
            question: "Respecting culture means:",
            options: [
                "Ignoring traditions",
                "Understanding names, food, and traditions",
                "Forcing your own habits",
                "Avoiding children"
            ],
            correctAnswerIndex: 1
        },
        {
            question: "Ethical response to parent query about another child:",
            options: [
                "I'll tell you everything",
                "I cannot share; let's focus on your child",
                "Ask another parent",
                "Ignore"
            ],
            correctAnswerIndex: 1
        },
        {
            question: "Professional communication with colleagues:",
            options: [
                "Complain constantly",
                "Share ideas respectfully",
                "Ignore teamwork",
                "Criticize publicly"
            ],
            correctAnswerIndex: 1
        },
        {
            question: "Reflective journal should include:",
            options: [
                "Only successes",
                "Successes, challenges, and new ideas",
                "Criticism of children",
                "Random notes"
            ],
            correctAnswerIndex: 1
        },
        {
            question: "Ethics require tutors to:",
            options: [
                "Follow safety rules",
                "Punish children physically",
                "Share private info",
                "Ignore culture"
            ],
            correctAnswerIndex: 0
        },
        {
            question: "Collaborative planning example:",
            options: [
                "Tutor A leads story; Tutor B handles materials",
                "Tutors work separately",
                "Tutor A does everything",
                "Ignore team roles"
            ],
            correctAnswerIndex: 0
        }
    ]
},
{
    id: "n8",
    title: "Digital Literacy for Nursery Teaching",
    description: "Learn to navigate the Prepskul Tutor Portal, use digital record-keeping, integrate tech-enhanced activities safely, share resources with peers, maintain online safety, and conduct digital assessments for nursery education.",
    content: {
        html: `<div class="space-y-10">

            <div class="space-y-6">
                <h1 class="text-3xl font-bold text-primary mb-2">Module 8: Digital Literacy for Nursery Teaching</h1>
                <p class="text-muted-foreground mb-6">(Duration: ~90 minutes)</p>

                <div class="bg-primary/5 border-l-4 border-primary p-4 rounded-r-lg">
                    <h3 class="font-bold text-lg mb-3 text-primary">🎯 Learning Objectives</h3>
                    <p class="text-sm mb-2">By the end of this module, tutors will be able to:</p>
                    <ul class="list-disc list-inside space-y-2 text-sm text-muted-foreground ml-4">
                        <li>Navigate and customize the Prepskul Tutor Portal efficiently for lesson planning and communication.</li>
                        <li>Record child progress digitally with photos, videos, and checklists.</li>
                        <li>Integrate short tech-based activities safely into daily lessons.</li>
                        <li>Collaborate with peers digitally and share resources in a professional manner.</li>
                        <li>Conduct digital assessments for observation-based skills.</li>
                        <li>Communicate progress to parents effectively via digital platforms.</li>
                        <li>Apply online safety and privacy standards in all digital activities.</li>
                        <li>Reflect on their digital teaching practices to improve effectiveness.</li>
                    </ul>
                </div>
            </div>

            <div class="space-y-6">
                <h2 class="text-2xl font-bold text-primary">8.1 Navigating Prepskul Tutor Portal & Lesson Templates</h2>

                <div class="bg-secondary/5 p-4 rounded-lg">
                    <h4 class="font-semibold text-lg mb-3">✨ Features & Use Cases</h4>
                    <ul class="list-disc list-inside space-y-2 text-sm text-muted-foreground ml-4">
                        <li>Ready-made lesson plans aligned to the Cameroon Nursery syllabus</li>
                        <li>Daily attendance tracker: automatically highlights absences</li>
                        <li>Parent messaging system: send photos, weekly updates, and skill feedback</li>
                        <li>Lesson template library: fill in objectives, materials, activities</li>
                    </ul>
                </div>

                <h4 class="font-semibold text-xl mb-3 mt-6">📋 Step-by-Step Practical Example</h4>
                <div class="bg-primary/5 p-4 rounded-lg">
                    <ol class="list-decimal list-inside space-y-2 text-sm text-muted-foreground ml-4">
                        <li>Log in → select Nursery 2, Term 1</li>
                        <li>Select theme: "Animals"</li>
                        <li>Open the lesson template → set objectives:
                            <ul class="list-disc list-inside ml-6 mt-2 space-y-1">
                                <li>Language: Name 3 animals</li>
                                <li>Math: Count 1–5 animals</li>
                                <li>Fine motor: Match toy animals to flashcards</li>
                            </ul>
                        </li>
                        <li>Add materials: photos, videos, flashcards</li>
                        <li>Save and preview lesson → share with parents</li>
                        <li>Track attendance → mark each child present or absent</li>
                    </ol>
                </div>

                <div class="bg-secondary/5 p-4 rounded-lg mt-6">
                    <h4 class="font-semibold text-lg mb-3">🧩 Mini-Challenge</h4>
                    <p class="text-muted-foreground">Customize a template for Nursery 3, "My Family", including one digital activity (e.g., short video or e-flashcard).</p>
                </div>
            </div>

            <div class="space-y-6">
                <h2 class="text-2xl font-bold text-primary">8.2 Digital Record-Keeping & Feedback</h2>

                <div class="bg-secondary/5 p-4 rounded-lg">
                    <h4 class="font-semibold text-lg mb-3">📝 Methods</h4>
                    <ul class="list-disc list-inside space-y-2 text-sm text-muted-foreground ml-4">
                        <li>Upload photos/videos showing children demonstrating skills</li>
                        <li>Tag each skill: e.g., "Color recognition," "Counting 1–10," "Fine motor skills"</li>
                        <li>Add a 1-line feedback for each child</li>
                        <li>Generate weekly or monthly reports automatically</li>
                    </ul>
                </div>

                <h4 class="font-semibold text-xl mb-3 mt-6">📊 Sample Entry</h4>
                <div class="relative overflow-x-auto shadow-sm rounded-lg">
                    <table class="w-full text-sm">
                        <thead class="bg-primary/5">
                            <tr>
                                <th class="px-4 py-3 text-left font-semibold">Child</th>
                                <th class="px-4 py-3 text-left font-semibold">Activity</th>
                                <th class="px-4 py-3 text-left font-semibold">Skill</th>
                                <th class="px-4 py-3 text-left font-semibold">Feedback</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr class="border-b border-primary/10">
                                <td class="px-4 py-3 font-medium">Awa</td>
                                <td class="px-4 py-3">Block stacking</td>
                                <td class="px-4 py-3">Counting 1–5</td>
                                <td class="px-4 py-3">"Awa stacked 5 blocks correctly, lined them in order."</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div class="bg-secondary/5 p-4 rounded-lg mt-6">
                    <h4 class="font-semibold text-lg mb-3">🧩 Mini-Exercise</h4>
                    <p class="text-muted-foreground mb-2">Record one child performing a counting or matching activity.</p>
                    <p class="text-muted-foreground">Tag the skill and write 1-line feedback to share with parents.</p>
                </div>

                <div class="bg-primary/5 p-4 rounded-lg mt-4">
                    <h4 class="font-semibold text-lg mb-3">🎭 Applied Role-Play</h4>
                    <p class="text-sm text-muted-foreground mb-2">Tutor sends photo/video to parent via portal.</p>
                    <p class="text-sm text-muted-foreground mb-2">Parent asks: "Did Awa manage to follow instructions?"</p>
                    <p class="text-sm text-muted-foreground italic">Response: "Yes! She counted 1–5 correctly and stacked blocks in order. Great progress!" ✅</p>
                </div>
            </div>

            <div class="space-y-6">
                <h2 class="text-2xl font-bold text-primary">8.3 Tech-Enhanced Lesson Integration</h2>

                <div class="bg-secondary/5 p-4 rounded-lg">
                    <h4 class="font-semibold text-lg mb-3">💻 Types of Tech Activities</h4>
                    <ul class="list-disc list-inside space-y-2 text-sm text-muted-foreground ml-4">
                        <li><strong>Short videos (2–3 min):</strong> songs, counting exercises, or storytelling</li>
                        <li><strong>E-flashcards:</strong> animals, colors, shapes, numbers with sounds</li>
                        <li><strong>Tablet rotation:</strong> 1 tablet per 5 children, max 3 minutes per child</li>
                        <li><strong>Interactive slides:</strong> children touch or drag shapes on a screen</li>
                    </ul>
                </div>

                <h4 class="font-semibold text-xl mb-3 mt-6">📝 Sample Lesson Plan — Theme: "Farm Animals"</h4>
                <div class="bg-primary/5 p-4 rounded-lg">
                    <ol class="list-decimal list-inside space-y-2 text-sm text-muted-foreground ml-4">
                        <li>Video (2 min) → show farm animals and their sounds</li>
                        <li>E-flashcard matching (3 min) → children match toy animals to flashcard images</li>
                        <li>Hands-on activity (5 min) → place toy animals in pen; count 1–5</li>
                        <li>Reflection discussion (3 min) → ask children "Which animal makes this sound?"</li>
                    </ol>
                </div>

                <div class="bg-secondary/5 p-4 rounded-lg mt-6">
                    <h4 class="font-semibold text-lg mb-3">🧩 Mini-Challenge</h4>
                    <p class="text-muted-foreground">Design a 3-step tech integration for any theme: video → e-flashcards → hands-on activity.</p>
                </div>
            </div>

            <div class="space-y-6">
                <h2 class="text-2xl font-bold text-primary">8.4 Sharing Resources with Peers Digitally</h2>

                <div class="bg-secondary/5 p-4 rounded-lg">
                    <h4 class="font-semibold text-lg mb-3">📤 Practical Examples</h4>
                    <div class="space-y-3">
                        <div class="bg-white/80 p-4 rounded border-l-4 border-primary">
                            <p class="text-sm font-semibold mb-2">Upload a video of a song or activity and add a short description:</p>
                            <p class="text-sm text-muted-foreground italic">"Nursery 2: Counting 1–5 using bean bags."</p>
                        </div>
                        <div class="bg-white/80 p-4 rounded border-l-4 border-primary">
                            <p class="text-sm font-semibold mb-2">Review peer-uploaded resources → provide constructive feedback:</p>
                            <p class="text-sm text-muted-foreground italic">"Worked well for 4–5 children; suggest larger props for visual clarity."</p>
                        </div>
                    </div>
                </div>

                <div class="bg-secondary/5 p-4 rounded-lg mt-6">
                    <h4 class="font-semibold text-lg mb-3">🧩 Mini-Challenge</h4>
                    <ul class="list-disc list-inside space-y-2 text-sm text-muted-foreground ml-4">
                        <li>Upload a resource to Prepskul forum</li>
                        <li>Comment on one peer resource and provide 1 improvement suggestion</li>
                    </ul>
                </div>

                <div class="bg-primary/5 p-4 rounded-lg mt-4">
                    <h4 class="font-semibold text-lg mb-3">💬 Reflective Prompt</h4>
                    <p class="text-muted-foreground">Which peer resources could you adapt for your own classroom tomorrow?</p>
                </div>
            </div>

            <div class="space-y-6">
                <h2 class="text-2xl font-bold text-primary">8.5 Online Safety & Privacy for Children</h2>

                <div class="bg-secondary/5 p-4 rounded-lg">
                    <h4 class="font-semibold text-lg mb-3">🔒 Key Safety Rules</h4>
                    <ul class="list-disc list-inside space-y-2 text-sm text-muted-foreground ml-4">
                        <li>No full names or identifying information online</li>
                        <li>Obtain parent consent for all photos/videos</li>
                        <li>Always supervise screen time</li>
                        <li>Use safe search and age-appropriate content filters</li>
                        <li>Limit tech usage to 2–3 min per child, rotate if multiple children</li>
                    </ul>
                </div>

                <div class="bg-primary/5 p-4 rounded-lg mt-6">
                    <h4 class="font-semibold text-lg mb-3">📝 Scenario Practice</h4>
                    <p class="text-sm text-muted-foreground mb-2">A child wants unsupervised tablet use. Tutor response:</p>
                    <p class="text-sm text-muted-foreground italic">"We will use it together for 3 minutes. I'll show you how to play safely." ✅</p>
                </div>

                <div class="bg-secondary/5 p-4 rounded-lg mt-6">
                    <h4 class="font-semibold text-lg mb-3">🧩 Mini-Challenge</h4>
                    <p class="text-muted-foreground mb-2">Create a digital safety checklist for your classroom with at least 5 items. Example:</p>
                    <ul class="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-4">
                        <li>No child names online</li>
                        <li>Screen time ≤3 min per child</li>
                        <li>Supervised activity</li>
                        <li>Approved educational content only</li>
                        <li>Upload only with parental consent</li>
                    </ul>
                </div>
            </div>

            <div class="space-y-6">
                <h2 class="text-2xl font-bold text-primary">8.6 Assessment Using Digital Tools</h2>

                <div class="bg-secondary/5 p-4 rounded-lg">
                    <h4 class="font-semibold text-lg mb-3">📊 Digital Assessment Techniques</h4>
                    <ul class="list-disc list-inside space-y-2 text-sm text-muted-foreground ml-4">
                        <li>Use photos and videos to document learning milestones</li>
                        <li>Tag activities for cognitive, social, emotional, physical, and creative skills</li>
                        <li>Compile weekly progress reports automatically</li>
                    </ul>
                </div>

                <div class="bg-secondary/5 p-4 rounded-lg mt-6">
                    <h4 class="font-semibold text-lg mb-3">🧩 Applied Mini-Exercise</h4>
                    <ul class="list-disc list-inside space-y-2 text-sm text-muted-foreground ml-4">
                        <li>Record a child performing fine motor, counting, and language skills</li>
                        <li>Upload and tag all 3 skills</li>
                        <li>Generate a progress report summary for a parent meeting</li>
                    </ul>
                </div>

                <div class="bg-primary/5 p-4 rounded-lg mt-4">
                    <h4 class="font-semibold text-lg mb-3">💬 Reflective Question</h4>
                    <p class="text-muted-foreground">How can digital tools improve the accuracy and speed of assessments compared to paper-based methods?</p>
                </div>
            </div>

            <div class="space-y-6">
                <h2 class="text-2xl font-bold text-primary">✅ Module 8 Summary & Reflection</h2>

                <ul class="list-disc list-inside space-y-2 text-sm text-muted-foreground ml-4">
                    <li>Plan, record, and track lessons digitally</li>
                    <li>Tech integration enhances play-based learning</li>
                    <li>Share resources and collaborate with peers</li>
                    <li>Maintain child safety online</li>
                    <li>Use digital tools for accurate assessment and parent communication</li>
                </ul>

                <div class="bg-secondary/5 p-4 rounded-lg">
                    <h4 class="font-semibold text-lg mb-3">💬 Reflection Prompt</h4>
                    <p class="text-muted-foreground mb-4">"What is one digital activity you can implement tomorrow that enhances learning, assessment, and parent communication?"</p>
                    <p class="text-sm text-muted-foreground">Write your reflection in your journal (3–5 sentences).</p>
                </div>
            </div>
        </div>`,
        videos: [
            {
                youtubeUrl: "https://www.youtube.com/watch?v=tutor-portal",
                caption: "Using a Tutor Portal Effectively"
            },
            {
                youtubeUrl: "https://www.youtube.com/watch?v=digital-assessment",
                caption: "Digital Assessment in Early Childhood"
            },
            {
                youtubeUrl: "https://www.youtube.com/watch?v=tech-integration",
                caption: "Integrating Technology in Nursery Lessons"
            },
            {
                youtubeUrl: "https://www.youtube.com/watch?v=sharing-resources",
                caption: "Sharing Digital Resources with Colleagues"
            },
            {
                youtubeUrl: "https://www.youtube.com/watch?v=online-safety",
                caption: "Online Safety for Young Children"
            }
        ]
    },
    sections: [
        {
            id: "n8s1",
            title: "8.1 Navigating Prepskul Tutor Portal & Lesson Templates",
            html: `<div class="space-y-4">
                <p class="text-muted-foreground">The Prepskul Tutor Portal features ready-made lesson plans aligned to the Cameroon Nursery syllabus, daily attendance tracker, parent messaging system, and lesson template library. Step-by-step: log in, select level and term, choose theme, customize template with objectives and materials, save and preview, track attendance.</p>
                <div class="bg-primary/5 p-4 rounded-lg">
                    <p class="font-semibold text-sm mb-2">Practical Tip:</p>
                    <p class="text-sm text-muted-foreground">Templates are editable to suit your classroom's needs. Always preview before sharing with parents.</p>
                </div>
            </div>`,
            youtubeUrl: "https://www.youtube.com/watch?v=tutor-portal",
            caption: "Using a Tutor Portal Effectively"
        },
        {
            id: "n8s2",
            title: "8.2 Digital Record-Keeping & Feedback",
            html: `<div class="space-y-4">
                <p class="text-muted-foreground">Methods include uploading photos/videos showing children demonstrating skills, tagging each skill (e.g., "Color recognition," "Counting 1–10"), adding 1-line feedback for each child, and generating weekly or monthly reports automatically. Example: Awa - Block stacking - Counting 1–5 - "Awa stacked 5 blocks correctly, lined them in order."</p>
            </div>`,
            youtubeUrl: "https://www.youtube.com/watch?v=digital-assessment",
            caption: "Digital Assessment in Early Childhood"
        },
        {
            id: "n8s3",
            title: "8.3 Tech-Enhanced Lesson Integration",
            html: `<div class="space-y-4">
                <p class="text-muted-foreground">Types of tech activities: short videos (2–3 min) for songs/counting/storytelling, e-flashcards for animals/colors/shapes/numbers with sounds, tablet rotation (1 tablet per 5 children, max 3 minutes per child), interactive slides. Sample lesson: Video (2 min) → E-flashcard matching (3 min) → Hands-on activity (5 min) → Reflection discussion (3 min).</p>
            </div>`,
            youtubeUrl: "https://www.youtube.com/watch?v=tech-integration",
            caption: "Integrating Technology in Nursery Lessons"
        },
        {
            id: "n8s4",
            title: "8.4 Sharing Resources with Peers Digitally",
            html: `<div class="space-y-4">
                <p class="text-muted-foreground">Upload videos or activities with short descriptions (e.g., "Nursery 2: Counting 1–5 using bean bags"). Review peer-uploaded resources and provide constructive feedback. Example: "Worked well for 4–5 children; suggest larger props for visual clarity."</p>
            </div>`,
            youtubeUrl: "https://www.youtube.com/watch?v=sharing-resources",
            caption: "Sharing Digital Resources with Colleagues"
        },
        {
            id: "n8s5",
            title: "8.5 Online Safety & Privacy for Children",
            html: `<div class="space-y-4">
                <p class="text-muted-foreground">Key safety rules: no full names or identifying information online, obtain parent consent for all photos/videos, always supervise screen time, use safe search and age-appropriate content filters, limit tech usage to 2–3 min per child. Example response to unsupervised tablet request: "We will use it together for 3 minutes. I'll show you how to play safely."</p>
            </div>`,
            youtubeUrl: "https://www.youtube.com/watch?v=online-safety",
            caption: "Online Safety for Young Children"
        },
        {
            id: "n8s6",
            title: "8.6 Assessment Using Digital Tools",
            html: `<div class="space-y-4">
                <p class="text-muted-foreground">Digital assessment techniques: use photos and videos to document learning milestones, tag activities for cognitive/social/emotional/physical/creative skills, compile weekly progress reports automatically. Applied exercise: record a child performing fine motor, counting, and language skills; upload and tag all 3 skills; generate a progress report summary.</p>
            </div>`,
            youtubeUrl: "https://www.youtube.com/watch?v=digital-assessment",
            caption: "Digital Assessment in Early Childhood"
        }
    ],
    quiz: [
        {
            question: "Prepskul Tutor Portal allows tutors to:",
            options: [
                "Track attendance",
                "Watch unrelated movies",
                "Replace play-based learning",
                "Ignore lesson planning"
            ],
            correctAnswerIndex: 0
        },
        {
            question: "Lesson templates can be:",
            options: [
                "Used as-is",
                "Customized",
                "Ignored",
                "Shared without context"
            ],
            correctAnswerIndex: 1
        },
        {
            question: "Digital feedback should include:",
            options: [
                "Photo/video + skill tag + 1-line comment",
                "Text only",
                "Long essay",
                "No feedback"
            ],
            correctAnswerIndex: 0
        },
        {
            question: "Screen time for nursery pupils should be:",
            options: [
                "Unlimited",
                "Short & supervised",
                "Daily 30 min",
                "Self-directed"
            ],
            correctAnswerIndex: 1
        },
        {
            question: "E-flashcards help in:",
            options: [
                "Memorization only",
                "Multi-sensory learning",
                "Ignoring play",
                "Increasing screen time only"
            ],
            correctAnswerIndex: 1
        },
        {
            question: "Tablet rotation guideline:",
            options: [
                "1 per child, unlimited",
                "1 per 5 children, max 3 min",
                "No limit",
                "Unsupervised"
            ],
            correctAnswerIndex: 1
        },
        {
            question: "Sharing resources digitally allows tutors to:",
            options: [
                "Build a community",
                "Replace lesson plans",
                "Ignore peers",
                "Hoard materials"
            ],
            correctAnswerIndex: 0
        },
        {
            question: "Online safety requires:",
            options: [
                "Parent consent",
                "Full child names online",
                "No supervision",
                "Unlimited sharing"
            ],
            correctAnswerIndex: 0
        },
        {
            question: "Tech activities should:",
            options: [
                "Replace hands-on play",
                "Enhance play-based learning",
                "Be self-directed",
                "Only for assessment"
            ],
            correctAnswerIndex: 1
        },
        {
            question: "Uploading a video to the forum should include:",
            options: [
                "Age group, objective, description",
                "Only video",
                "Private info",
                "No explanation"
            ],
            correctAnswerIndex: 0
        },
        {
            question: "Digital record-keeping helps tutors to:",
            options: [
                "Track progress over time",
                "Replace anecdotal notes",
                "Avoid reflection",
                "Compare children publicly"
            ],
            correctAnswerIndex: 0
        },
        {
            question: "Mini-tech activities should:",
            options: [
                "Last 10–15 min per child",
                "2–3 min per child",
                "Be unsupervised",
                "Replace story time"
            ],
            correctAnswerIndex: 1
        },
        {
            question: "Parent communication via portal should include:",
            options: [
                "Evidence + next goal",
                "Complaints only",
                "Grades only",
                "Ignore parents"
            ],
            correctAnswerIndex: 0
        },
        {
            question: "Safe search ensures:",
            options: [
                "Any content",
                "Age-appropriate content",
                "Block all resources",
                "No supervision"
            ],
            correctAnswerIndex: 1
        },
        {
            question: "Example of tech integration:",
            options: [
                "Video → discussion → hands-on activity",
                "Only video",
                "Only tablet game",
                "Ignore play"
            ],
            correctAnswerIndex: 0
        }
    ]
}
		],
	},

	{
		id: 'primary',
		name: 'Primary',
		description: 'Literacy, numeracy, competency-based curriculum, and holistic development for ages 6-11.',
		modules: [
			{
				id: 'p1',
				title: 'Understanding Primary Education in Cameroon',
				description: 'Learn the structure of Basic Education in Cameroon, the goals of Primary Education under CBC & PLP frameworks, key skills and competencies from Class 1 to Class 6, and the professional role of a Primary Tutor.',
				content: {
					html: `<div class="space-y-6">
						<div class="bg-primary/5 border-l-4 border-primary p-4 rounded-r-lg">
							<h3 class="font-bold text-lg mb-3 text-primary">🎯 Learning Objectives</h3>
							<p class="text-sm mb-2">By the end of this module, trainees will be able to:</p>
							<ul class="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-4">
								<li>Explain the structure and organization of Basic Education in Cameroon</li>
								<li>Describe the goals and vision of Primary Education under the CBC & PLP frameworks</li>
								<li>Identify key skills and expected competencies from Class 1 to Class 6</li>
								<li>Distinguish between Lower and Upper Primary levels</li>
								<li>Understand the roles, duties, and professional ethics of a Primary Tutor</li>
								<li>Apply a child-centered and competency-based teaching philosophy in lesson delivery</li>
							</ul>
						</div>

						<section class="space-y-4">
							<h2 class="text-2xl font-bold text-primary">1.1 Overview of Basic Education Structure in Cameroon</h2>
							<p class="text-muted-foreground">Cameroon's education system is designed to develop the child holistically — intellectually, socially, morally, and emotionally — through a series of structured stages known collectively as Basic Education.</p>
							<div class="overflow-x-auto my-4">
								<table class="min-w-full border-collapse border border-primary/20">
									<thead class="bg-primary/10">
										<tr>
											<th class="border border-primary/20 p-2 text-left text-sm font-semibold">LEVEL</th>
											<th class="border border-primary/20 p-2 text-left text-sm font-semibold">AGE RANGE</th>
											<th class="border border-primary/20 p-2 text-left text-sm font-semibold">KEY FOCUS AREA</th>
										</tr>
									</thead>
									<tbody class="text-sm">
										<tr>
											<td class="border border-primary/20 p-2">Pre-primary (Nursery)</td>
											<td class="border border-primary/20 p-2">3–5 years</td>
											<td class="border border-primary/20 p-2">Play, socialization, emotional and language foundation</td>
										</tr>
										<tr class="bg-muted/30">
											<td class="border border-primary/20 p-2 font-medium">Primary (Our Focus)</td>
											<td class="border border-primary/20 p-2 font-medium">6–11 years</td>
											<td class="border border-primary/20 p-2 font-medium">Literacy, numeracy, citizenship, and moral values</td>
										</tr>
										<tr>
											<td class="border border-primary/20 p-2">Secondary</td>
											<td class="border border-primary/20 p-2">12–18 years</td>
											<td class="border border-primary/20 p-2">Academic, technical, and vocational specialization</td>
										</tr>
										<tr class="bg-muted/30">
											<td class="border border-primary/20 p-2">Tertiary</td>
											<td class="border border-primary/20 p-2">18+ years</td>
											<td class="border border-primary/20 p-2">Higher education and professional development</td>
										</tr>
									</tbody>
								</table>
							</div>

							<h3 class="text-xl font-semibold mt-6">Structure of Primary School</h3>
							<p class="text-muted-foreground">Primary education in Cameroon lasts six years and is divided into two main cycles:</p>
							<div class="overflow-x-auto my-4">
								<table class="min-w-full border-collapse border border-primary/20">
									<thead class="bg-primary/10">
										<tr>
											<th class="border border-primary/20 p-2 text-left text-sm font-semibold">Cycle</th>
											<th class="border border-primary/20 p-2 text-left text-sm font-semibold">Class Levels</th>
											<th class="border border-primary/20 p-2 text-left text-sm font-semibold">Age Range</th>
											<th class="border border-primary/20 p-2 text-left text-sm font-semibold">Main Learning Focus</th>
										</tr>
									</thead>
									<tbody class="text-sm">
										<tr>
											<td class="border border-primary/20 p-2 font-medium">Lower Basic (First Cycle)</td>
											<td class="border border-primary/20 p-2">Class 1 – 3</td>
											<td class="border border-primary/20 p-2">6–8 years</td>
											<td class="border border-primary/20 p-2">Reading, phonics, handwriting, numeracy foundations</td>
										</tr>
										<tr class="bg-muted/30">
											<td class="border border-primary/20 p-2 font-medium">Upper Basic (Second Cycle)</td>
											<td class="border border-primary/20 p-2">Class 4 – 6</td>
											<td class="border border-primary/20 p-2">9–11 years</td>
											<td class="border border-primary/20 p-2">Logic, grammar, science, citizenship, exam readiness</td>
										</tr>
									</tbody>
								</table>
							</div>

							<h3 class="text-xl font-semibold mt-6">Governance and Curriculum</h3>
							<div class="bg-muted/50 p-4 rounded-lg my-4">
								<ul class="space-y-2 text-sm">
									<li><strong>MINEDUB</strong> – Ministry of Basic Education (policy & supervision)</li>
									<li><strong>CBC</strong> – Competency-Based Curriculum (current curriculum approach)</li>
									<li><strong>Language Policy</strong> – Bilingual Education (English + French) to promote national unity and inclusion</li>
								</ul>
							</div>
						</section>

						<section class="space-y-4">
							<h2 class="text-2xl font-bold text-primary">1.2 The Aims and Vision of Primary Education (CBC Perspective)</h2>
							<p class="text-muted-foreground">The Competency-Based Curriculum (CBC) envisions a Cameroonian child who is:</p>
							<ul class="list-disc list-inside space-y-2 ml-4 text-muted-foreground">
								<li>A competent and lifelong learner</li>
								<li>A disciplined and morally upright citizen</li>
								<li>A creative and critical problem-solver</li>
								<li>A team player and effective communicator</li>
								<li>A productive and patriotic member of society</li>
							</ul>

							<h3 class="text-xl font-semibold mt-6">🌍 CBC Core Competencies and Expected Outcomes</h3>
							<div class="overflow-x-auto my-4">
								<table class="min-w-full border-collapse border border-primary/20">
									<thead class="bg-primary/10">
										<tr>
											<th class="border border-primary/20 p-2 text-left text-sm font-semibold">Core Competency</th>
											<th class="border border-primary/20 p-2 text-left text-sm font-semibold">Expected Learning Outcome</th>
										</tr>
									</thead>
									<tbody class="text-sm">
										<tr>
											<td class="border border-primary/20 p-2 font-medium">Communication</td>
											<td class="border border-primary/20 p-2">Reads fluently, listens actively, and expresses ideas clearly</td>
										</tr>
										<tr class="bg-muted/30">
											<td class="border border-primary/20 p-2 font-medium">Critical Thinking & Problem Solving</td>
											<td class="border border-primary/20 p-2">Analyzes information and applies knowledge to real-life challenges</td>
										</tr>
										<tr>
											<td class="border border-primary/20 p-2 font-medium">Collaboration & Teamwork</td>
											<td class="border border-primary/20 p-2">Works effectively with others to achieve shared goals</td>
										</tr>
										<tr class="bg-muted/30">
											<td class="border border-primary/20 p-2 font-medium">Digital Literacy</td>
											<td class="border border-primary/20 p-2">Uses digital tools safely and productively for learning</td>
										</tr>
										<tr>
											<td class="border border-primary/20 p-2 font-medium">Citizenship & Values</td>
											<td class="border border-primary/20 p-2">Demonstrates respect, patriotism, and social responsibility</td>
										</tr>
									</tbody>
								</table>
							</div>
						</section>

						<section class="space-y-4">
							<h2 class="text-2xl font-bold text-primary">1.3 What Makes Primary Education Different from Nursery?</h2>
							<p class="text-muted-foreground">The transition from nursery to primary marks a shift from learning through play to structured learning and foundational skill development.</p>
							<div class="overflow-x-auto my-4">
								<table class="min-w-full border-collapse border border-primary/20">
									<thead class="bg-primary/10">
										<tr>
											<th class="border border-primary/20 p-2 text-left text-sm font-semibold">Nursery (Pre-Primary)</th>
											<th class="border border-primary/20 p-2 text-left text-sm font-semibold">Primary Education</th>
										</tr>
									</thead>
									<tbody class="text-sm">
										<tr>
											<td class="border border-primary/20 p-2">Mainly play-based learning</td>
											<td class="border border-primary/20 p-2">Combination of play and structured academic work</td>
										</tr>
										<tr class="bg-muted/30">
											<td class="border border-primary/20 p-2">Focus on interaction, sounds, and oral language</td>
											<td class="border border-primary/20 p-2">Focus on reading, writing, and composition</td>
										</tr>
										<tr>
											<td class="border border-primary/20 p-2">Simple counting and shapes</td>
											<td class="border border-primary/20 p-2">Advanced arithmetic and applied problem-solving</td>
										</tr>
										<tr class="bg-muted/30">
											<td class="border border-primary/20 p-2">Short, playful activities</td>
											<td class="border border-primary/20 p-2">Longer, more focused learning tasks</td>
										</tr>
										<tr>
											<td class="border border-primary/20 p-2">Emphasis on socialization</td>
											<td class="border border-primary/20 p-2">Emphasis on literacy, numeracy, and discipline</td>
										</tr>
									</tbody>
								</table>
							</div>
						</section>

						<section class="space-y-4">
							<h2 class="text-2xl font-bold text-primary">1.4 Subjects Taught Under MINEDUB Curriculum</h2>
							<div class="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
								<div class="bg-primary/5 p-4 rounded-lg">
									<h3 class="font-semibold mb-2">Lower Primary (Class 1–3)</h3>
									<ul class="list-disc list-inside space-y-1 text-sm text-muted-foreground">
										<li>English / French</li>
										<li>Mathematics</li>
										<li>Science & Health Education</li>
										<li>Social Studies</li>
										<li>Moral Instruction</li>
										<li>Creative Arts</li>
										<li>Physical Education (PE)</li>
										<li>ICT (Introduction)</li>
									</ul>
								</div>
								<div class="bg-primary/5 p-4 rounded-lg">
									<h3 class="font-semibold mb-2">Upper Primary (Class 4–6)</h3>
									<ul class="list-disc list-inside space-y-1 text-sm text-muted-foreground">
										<li>English / French</li>
										<li>Mathematics</li>
										<li>Science</li>
										<li>ICT & Basic Coding</li>
										<li>Civic & Moral Education</li>
										<li>History</li>
										<li>Physical Education</li>
										<li>Arts & Music</li>
									</ul>
								</div>
							</div>
							<div class="bg-primary/10 p-4 rounded-lg my-4">
								<p class="font-semibold mb-2">Key Priority Subjects:</p>
								<ul class="list-disc list-inside space-y-1 text-sm">
									<li>✅ English</li>
									<li>✅ Mathematics</li>
									<li>✅ French</li>
								</ul>
							</div>
						</section>

						<section class="space-y-4">
							<h2 class="text-2xl font-bold text-primary">1.5 The Role and Responsibilities of a Primary Tutor</h2>
							<p class="text-muted-foreground">A Primary Tutor is not just a teacher but a guide, mentor, and role model.</p>
							<div class="bg-primary/5 p-4 rounded-lg my-4">
								<h3 class="font-semibold mb-3">🧑‍🏫 The Primary Tutor is:</h3>
								<ul class="space-y-2 text-sm">
									<li><strong>A Teacher:</strong> Plans lessons, explains concepts, and supports learning.</li>
									<li><strong>A Facilitator:</strong> Encourages discovery and active participation.</li>
									<li><strong>An Assessor:</strong> Monitors learning progress through continuous assessment.</li>
									<li><strong>A Role Model:</strong> Demonstrates values like respect, patience, and honesty.</li>
									<li><strong>A Parent Liaison:</strong> Communicates effectively with parents and guardians.</li>
									<li><strong>A Digital Guide:</strong> Introduces safe and productive use of technology for learning.</li>
								</ul>
							</div>
						</section>

						<section class="space-y-4">
							<h2 class="text-2xl font-bold text-primary">1.6 Teaching Philosophy in the CBC Context</h2>
							<p class="text-muted-foreground">The CBC promotes active, learner-centered, and competency-oriented education.</p>
							<div class="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
								<div class="bg-green-50 dark:bg-green-950/20 p-4 rounded-lg border-l-4 border-green-500">
									<h3 class="font-semibold mb-2 text-green-700 dark:text-green-400">✅ Do's (Best Practices)</h3>
									<ul class="list-disc list-inside space-y-1 text-sm text-muted-foreground">
										<li>Prioritize learner-centered methods</li>
										<li>Teach phonics before reading</li>
										<li>Use inquiry-based science and hands-on mathematics</li>
										<li>Use stories, songs, and role-play to teach social and moral lessons</li>
										<li>Focus on competency over memorization</li>
										<li>Emphasize continuous assessment over one-time exams</li>
										<li>Promote cultural respect and moral values</li>
									</ul>
								</div>
								<div class="bg-red-50 dark:bg-red-950/20 p-4 rounded-lg border-l-4 border-red-500">
									<h3 class="font-semibold mb-2 text-red-700 dark:text-red-400">❌ Don'ts (Outdated Practices)</h3>
									<ul class="list-disc list-inside space-y-1 text-sm text-muted-foreground">
										<li>Overreliance on lecturing and rote learning</li>
										<li>Punitive or fear-based discipline ("cane mentality")</li>
										<li>Shame-based correction that lowers self-esteem</li>
										<li>Neglecting learners' individual differences and learning needs</li>
									</ul>
								</div>
							</div>

							<div class="bg-primary/5 p-4 rounded-lg my-4">
								<h3 class="font-semibold mb-2">🧠 The Primary Tutor's Mindset</h3>
								<p class="text-sm text-muted-foreground mb-2">Children aged 6–11:</p>
								<ul class="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-4">
									<li>Learn best by doing, exploring, and interacting</li>
									<li>Need repetition, praise, and structure</li>
									<li>Ask many questions — curiosity drives understanding</li>
									<li>Thrive in a positive, caring, and well-organized environment</li>
									<li>Are developing self-confidence and independence</li>
								</ul>
								<blockquote class="border-l-4 border-primary/50 pl-4 italic text-muted-foreground mt-4">
									<strong>Golden Rule:</strong> "Teach the child, not the topic."
								</blockquote>
							</div>
						</section>

						<section class="space-y-4">
							<h2 class="text-2xl font-bold text-primary">👨‍🏫 Reflection Activity</h2>
							<div class="bg-muted/50 p-4 rounded-lg">
								<p class="text-sm text-muted-foreground mb-2">Write your answer in your teacher notebook:</p>
								<p class="text-sm font-medium mb-2">❓ Why do some pupils struggle from Class 1 to Class 6 in Cameroon schools?</p>
								<p class="text-xs text-muted-foreground italic">Hint: Consider weak literacy foundations, lack of phonics instruction, fear-based classroom culture, limited home support, and low learner confidence.</p>
							</div>
						</section>
					</div>`
				},
				quiz: [
					{
						question: "Primary school lasts how many years?",
						options: [
							"4 years",
							"5 years",
							"6 years",
							"7 years"
						],
						correctAnswerIndex: 2
					},
					{
						question: "Which ministry oversees primary education?",
						options: [
							"MINESEC",
							"MINEDUB",
							"MINESUP",
							"MINJEC"
						],
						correctAnswerIndex: 1
					},
					{
						question: "CBC stands for?",
						options: [
							"Community-Based Curriculum",
							"Competency-Based Curriculum",
							"Content-Based Curriculum",
							"Continuous Basic Course"
						],
						correctAnswerIndex: 1
					},
					{
						question: "Lower Primary classes include?",
						options: [
							"Classes 1–2",
							"Classes 1–3",
							"Classes 1–4",
							"Classes 2–4"
						],
						correctAnswerIndex: 1
					},
					{
						question: "A primary tutor should be a…",
						options: [
							"Lecturer only",
							"Facilitator, model, and guide",
							"Disciplinarian only",
							"Examiner only"
						],
						correctAnswerIndex: 1
					},
					{
						question: "Punitive teaching style is…",
						options: [
							"Recommended",
							"Not allowed",
							"Optional",
							"Only for difficult classes"
						],
						correctAnswerIndex: 1
					},
					{
						question: "Main language policy in schools?",
						options: [
							"English only",
							"French only",
							"Bilingual (English & French)",
							"Mother tongue only"
						],
						correctAnswerIndex: 2
					}
				],
				sections: [
					{
						id: '1-1',
						title: '1.1 Overview of Basic Education Structure in Cameroon',
						html: `<div class="space-y-4">
							<p class="text-muted-foreground">Cameroon's education system is designed to develop the child holistically — intellectually, socially, morally, and emotionally — through a series of structured stages known collectively as Basic Education.</p>
							<div class="overflow-x-auto my-4">
								<table class="min-w-full border-collapse border border-primary/20">
									<thead class="bg-primary/10">
										<tr>
											<th class="border border-primary/20 p-2 text-left text-sm font-semibold">LEVEL</th>
											<th class="border border-primary/20 p-2 text-left text-sm font-semibold">AGE RANGE</th>
											<th class="border border-primary/20 p-2 text-left text-sm font-semibold">KEY FOCUS AREA</th>
										</tr>
									</thead>
									<tbody class="text-sm">
										<tr>
											<td class="border border-primary/20 p-2">Pre-primary (Nursery)</td>
											<td class="border border-primary/20 p-2">3–5 years</td>
											<td class="border border-primary/20 p-2">Play, socialization, emotional and language foundation</td>
										</tr>
										<tr class="bg-muted/30">
											<td class="border border-primary/20 p-2 font-medium">Primary (Our Focus)</td>
											<td class="border border-primary/20 p-2 font-medium">6–11 years</td>
											<td class="border border-primary/20 p-2 font-medium">Literacy, numeracy, citizenship, and moral values</td>
										</tr>
										<tr>
											<td class="border border-primary/20 p-2">Secondary</td>
											<td class="border border-primary/20 p-2">12–18 years</td>
											<td class="border border-primary/20 p-2">Academic, technical, and vocational specialization</td>
										</tr>
										<tr class="bg-muted/30">
											<td class="border border-primary/20 p-2">Tertiary</td>
											<td class="border border-primary/20 p-2">18+ years</td>
											<td class="border border-primary/20 p-2">Higher education and professional development</td>
										</tr>
									</tbody>
								</table>
							</div>
							<h3 class="text-xl font-semibold mt-6">Structure of Primary School</h3>
							<p class="text-muted-foreground">Primary education in Cameroon lasts six years and is divided into two main cycles: Lower Basic (Class 1–3, ages 6–8) and Upper Basic (Class 4–6, ages 9–11).</p>
						</div>`,
						youtubeUrl: '',
						caption: 'Basic Education Structure in Cameroon'
					},
					{
						id: '1-2',
						title: '1.2 The Aims and Vision of Primary Education (CBC Perspective)',
						html: `<div class="space-y-4">
							<p class="text-muted-foreground">The Competency-Based Curriculum (CBC) envisions a Cameroonian child who is a competent and lifelong learner, disciplined and morally upright, creative and critical problem-solver, team player and effective communicator, and a productive and patriotic member of society.</p>
							<p class="text-muted-foreground">Core competencies include Communication, Critical Thinking & Problem Solving, Collaboration & Teamwork, Digital Literacy, and Citizenship & Values.</p>
						</div>`,
						youtubeUrl: '',
						caption: 'CBC Vision and Competencies'
					},
					{
						id: '1-3',
						title: '1.3 What Makes Primary Education Different from Nursery?',
						html: `<div class="space-y-4">
							<p class="text-muted-foreground">The transition from nursery to primary marks a shift from learning through play to structured learning and foundational skill development. Primary combines play and structured academic work, focuses on reading and writing, and emphasizes literacy, numeracy, and discipline.</p>
						</div>`,
						youtubeUrl: '',
						caption: 'Nursery vs Primary Education'
					},
					{
						id: '1-4',
						title: '1.4 Subjects Taught Under MINEDUB Curriculum',
						html: `<div class="space-y-4">
							<p class="text-muted-foreground">Lower Primary (Class 1–3) includes English/French, Mathematics, Science & Health Education, Social Studies, Moral Instruction, Creative Arts, PE, and ICT Introduction.</p>
							<p class="text-muted-foreground">Upper Primary (Class 4–6) includes English/French, Mathematics, Science, ICT & Basic Coding, Civic & Moral Education, History, PE, and Arts & Music.</p>
							<p class="text-muted-foreground font-semibold">Key Priority Subjects: English, Mathematics, French</p>
						</div>`,
						youtubeUrl: '',
						caption: 'Primary School Subjects'
					},
					{
						id: '1-5',
						title: '1.5 The Role and Responsibilities of a Primary Tutor',
						html: `<div class="space-y-4">
							<p class="text-muted-foreground">A Primary Tutor is a teacher, facilitator, assessor, role model, parent liaison, and digital guide. They plan lessons, encourage discovery, monitor progress, demonstrate values, communicate with parents, and introduce safe technology use.</p>
						</div>`,
						youtubeUrl: '',
						caption: 'Primary Tutor Role'
					},
					{
						id: '1-6',
						title: '1.6 Teaching Philosophy in the CBC Context',
						html: `<div class="space-y-4">
							<p class="text-muted-foreground">The CBC promotes active, learner-centered, and competency-oriented education. Best practices include prioritizing learner-centered methods, teaching phonics before reading, using inquiry-based science, focusing on competency over memorization, and emphasizing continuous assessment.</p>
							<p class="text-muted-foreground font-semibold">Golden Rule: "Teach the child, not the topic."</p>
						</div>`,
						youtubeUrl: '',
						caption: 'CBC Teaching Philosophy'
					}
				]
			},
			{
				id: 'p2',
				title: 'Child Development (Ages 6–11) & Learning Psychology',
				description: 'Understand physical, cognitive, emotional, and social development characteristics of children aged 6–11, identify differences between Lower and Upper Primary learners, and apply behavior management strategies rooted in psychology.',
				content: {
					html: `<div class="space-y-6">
						<div class="bg-primary/5 border-l-4 border-primary p-4 rounded-r-lg">
							<h3 class="font-bold text-lg mb-3 text-primary">🎯 Learning Objectives</h3>
							<p class="text-sm mb-2">By the end of this module, trainees will be able to:</p>
							<ul class="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-4">
								<li>Explain the major physical, cognitive, emotional, and social development characteristics of children aged 6–11</li>
								<li>Identify differences between Lower Primary (6–8) and Upper Primary (9–11) learners</li>
								<li>Understand how attention span and motivation influence learning behavior</li>
								<li>Describe how children acquire new skills such as reading, writing, and mathematics</li>
								<li>Apply behavior management strategies rooted in psychology rather than punishment</li>
								<li>Support diverse learners — shy, hyperactive, slow-learning, or anxious pupils</li>
								<li>Promote inclusive, safe, and positive classrooms using non-punitive discipline</li>
							</ul>
						</div>

						<section class="space-y-4">
							<h2 class="text-2xl font-bold text-primary">2.1 Age Characteristics of Primary Learners</h2>
							<p class="text-muted-foreground">Understanding how children grow and learn at different stages helps teachers adapt lessons effectively.</p>
							
							<h3 class="text-xl font-semibold mt-6">✅ Lower Primary (6–8 years — Classes 1–3)</h3>
							<div class="overflow-x-auto my-4">
								<table class="min-w-full border-collapse border border-primary/20">
									<thead class="bg-primary/10">
										<tr>
											<th class="border border-primary/20 p-2 text-left text-sm font-semibold">Development Area</th>
											<th class="border border-primary/20 p-2 text-left text-sm font-semibold">Characteristics</th>
										</tr>
									</thead>
									<tbody class="text-sm">
										<tr>
											<td class="border border-primary/20 p-2 font-medium">Cognitive</td>
											<td class="border border-primary/20 p-2">Beginning to use logic; learning phonics, basic reading, and number concepts</td>
										</tr>
										<tr class="bg-muted/30">
											<td class="border border-primary/20 p-2 font-medium">Language</td>
											<td class="border border-primary/20 p-2">Vocabulary growing rapidly; still think literally ("black and white" understanding)</td>
										</tr>
										<tr>
											<td class="border border-primary/20 p-2 font-medium">Attention</td>
											<td class="border border-primary/20 p-2">Short attention span (10–15 minutes); need frequent movement and breaks</td>
										</tr>
										<tr class="bg-muted/30">
											<td class="border border-primary/20 p-2 font-medium">Social</td>
											<td class="border border-primary/20 p-2">Seek teacher approval; beginning to build friendships and teamwork skills</td>
										</tr>
										<tr>
											<td class="border border-primary/20 p-2 font-medium">Emotional</td>
											<td class="border border-primary/20 p-2">Sensitive to tone; respond best to praise, patience, and encouragement</td>
										</tr>
										<tr class="bg-muted/30">
											<td class="border border-primary/20 p-2 font-medium">Motor Skills</td>
											<td class="border border-primary/20 p-2">Improving handwriting grip, coordination, and body control through play</td>
										</tr>
									</tbody>
								</table>
							</div>

							<h3 class="text-xl font-semibold mt-6">✅ Upper Primary (9–11 years — Classes 4–6)</h3>
							<div class="overflow-x-auto my-4">
								<table class="min-w-full border-collapse border border-primary/20">
									<thead class="bg-primary/10">
										<tr>
											<th class="border border-primary/20 p-2 text-left text-sm font-semibold">Development Area</th>
											<th class="border border-primary/20 p-2 text-left text-sm font-semibold">Characteristics</th>
										</tr>
									</thead>
									<tbody class="text-sm">
										<tr>
											<td class="border border-primary/20 p-2 font-medium">Cognitive</td>
											<td class="border border-primary/20 p-2">Understands cause-and-effect, reasoning, and multi-step problem-solving</td>
										</tr>
										<tr class="bg-muted/30">
											<td class="border border-primary/20 p-2 font-medium">Language</td>
											<td class="border border-primary/20 p-2">Can summarize, report, and give oral presentations</td>
										</tr>
										<tr>
											<td class="border border-primary/20 p-2 font-medium">Attention</td>
											<td class="border border-primary/20 p-2">Sustains attention for 20–30 minutes with activity variation</td>
										</tr>
										<tr class="bg-muted/30">
											<td class="border border-primary/20 p-2 font-medium">Social</td>
											<td class="border border-primary/20 p-2">Forms stronger peer identities and small groups (cliques); values friendship</td>
										</tr>
										<tr>
											<td class="border border-primary/20 p-2 font-medium">Emotional</td>
											<td class="border border-primary/20 p-2">Developing self-confidence; some may face self-esteem challenges</td>
										</tr>
										<tr class="bg-muted/30">
											<td class="border border-primary/20 p-2 font-medium">Motor Skills</td>
											<td class="border border-primary/20 p-2">Improved coordination, drawing, sports, and handwriting control</td>
										</tr>
									</tbody>
								</table>
							</div>
							<div class="bg-primary/5 p-4 rounded-lg my-4">
								<p class="font-semibold mb-2">Key Point:</p>
								<p class="text-sm text-muted-foreground">A good teacher adjusts instruction to suit the child's developmental level — not the other way around.</p>
							</div>
						</section>

						<section class="space-y-4">
							<h2 class="text-2xl font-bold text-primary">2.2 Brain & Learning Theory (Simplified for Classroom Application)</h2>
							<p class="text-muted-foreground">Understanding basic child psychology helps teachers choose effective teaching strategies.</p>
							
							<h3 class="text-xl font-semibold mt-6">🧠 Piaget – Concrete Operational Stage (Ages 7–11)</h3>
							<p class="text-muted-foreground">Children at this stage:</p>
							<ul class="list-disc list-inside space-y-2 ml-4 text-muted-foreground">
								<li>Think best with real objects and practical examples</li>
								<li>Struggle with abstract or hypothetical ideas</li>
								<li>Learn effectively through manipulatives, drawings, experiments, and role-play</li>
								<li>Can classify, compare, measure, and order objects logically</li>
							</ul>
							<div class="bg-primary/5 p-4 rounded-lg my-4">
								<p class="font-semibold mb-2">Example:</p>
								<p class="text-sm text-muted-foreground">Before teaching "fractions", use fruits, papers, or bottle caps to show halves and quarters.</p>
							</div>

							<h3 class="text-xl font-semibold mt-6">👥 Vygotsky – Learning Through Social Interaction</h3>
							<p class="text-muted-foreground">Children learn best when they are guided through social interaction and peer collaboration.</p>
							<ul class="list-disc list-inside space-y-2 ml-4 text-muted-foreground">
								<li>Learning happens in the Zone of Proximal Development (ZPD) — between what a child can do alone and what they can do with help.</li>
								<li>Teachers should scaffold learning by providing gradual support.</li>
								<li>Encourage discussion, questioning, and teamwork.</li>
							</ul>
							<div class="bg-primary/5 p-4 rounded-lg my-4">
								<p class="font-semibold mb-2">Teacher phrase:</p>
								<p class="text-sm text-muted-foreground">"Work with your partner — explain your answer to each other."</p>
							</div>

							<h3 class="text-xl font-semibold mt-6">💪 Erikson – Psychosocial Stage: Industry vs. Inferiority (Ages 6–11)</h3>
							<p class="text-muted-foreground">At this stage, children want to feel capable, productive, and recognized.</p>
							<div class="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
								<div class="bg-green-50 dark:bg-green-950/20 p-4 rounded-lg border-l-4 border-green-500">
									<h4 class="font-semibold mb-2 text-green-700 dark:text-green-400">✅ Do</h4>
									<ul class="list-disc list-inside space-y-1 text-sm text-muted-foreground">
										<li>Praise effort and progress, not just results</li>
										<li>Give classroom responsibilities (line leader, monitor)</li>
										<li>Celebrate small improvements and persistence</li>
									</ul>
								</div>
								<div class="bg-red-50 dark:bg-red-950/20 p-4 rounded-lg border-l-4 border-red-500">
									<h4 class="font-semibold mb-2 text-red-700 dark:text-red-400">❌ Avoid</h4>
									<p class="text-sm text-muted-foreground mb-2">Shaming or labeling ("lazy," "slow") — it damages confidence and motivation.</p>
									<p class="text-sm font-medium">Replace: "You are slow."</p>
									<p class="text-sm font-medium text-green-600 dark:text-green-400">With: "Let's practice again. You're improving each time!"</p>
								</div>
							</div>
						</section>

						<section class="space-y-4">
							<h2 class="text-2xl font-bold text-primary">2.3 Attention Span and Focus</h2>
							<p class="text-muted-foreground">Attention develops gradually with age and activity engagement.</p>
							<div class="overflow-x-auto my-4">
								<table class="min-w-full border-collapse border border-primary/20">
									<thead class="bg-primary/10">
										<tr>
											<th class="border border-primary/20 p-2 text-left text-sm font-semibold">Age</th>
											<th class="border border-primary/20 p-2 text-left text-sm font-semibold">Average Attention Span</th>
										</tr>
									</thead>
									<tbody class="text-sm">
										<tr>
											<td class="border border-primary/20 p-2">6–7 years</td>
											<td class="border border-primary/20 p-2">10–12 minutes</td>
										</tr>
										<tr class="bg-muted/30">
											<td class="border border-primary/20 p-2">8–9 years</td>
											<td class="border border-primary/20 p-2">15–20 minutes</td>
										</tr>
										<tr>
											<td class="border border-primary/20 p-2">10–11 years</td>
											<td class="border border-primary/20 p-2">20–30 minutes</td>
										</tr>
									</tbody>
								</table>
							</div>

							<h3 class="text-xl font-semibold mt-6">Strategies to Sustain Attention</h3>
							<div class="bg-primary/5 p-4 rounded-lg my-4">
								<ul class="list-disc list-inside space-y-2 text-sm text-muted-foreground">
									<li>✅ Use brain breaks (2–3 minutes of stretching, songs, or quick games)</li>
									<li>✅ Incorporate call-and-response to regain focus</li>
									<li>✅ Add movement-based tasks: "Touch something blue." "Stand up if your answer is an odd number."</li>
								</ul>
								<p class="text-sm text-muted-foreground mt-2">These small changes re-energize learners and prevent boredom.</p>
							</div>
						</section>

						<section class="space-y-4">
							<h2 class="text-2xl font-bold text-primary">2.4 Motivation Psychology in Primary Learners</h2>
							<p class="text-muted-foreground">Children perform best when they feel valued, encouraged, and successful.</p>
							
							<h3 class="text-xl font-semibold mt-6">💡 Types of Motivation</h3>
							<div class="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
								<div class="bg-green-50 dark:bg-green-950/20 p-4 rounded-lg">
									<h4 class="font-semibold mb-2">Positive Motivation</h4>
									<ul class="list-disc list-inside space-y-1 text-sm text-muted-foreground">
										<li>Praise & encouragement</li>
										<li>Reward systems (stars, smileys)</li>
										<li>Classroom roles & responsibility</li>
										<li>Recognition of effort</li>
									</ul>
								</div>
								<div class="bg-red-50 dark:bg-red-950/20 p-4 rounded-lg">
									<h4 class="font-semibold mb-2">Negative Motivation</h4>
									<ul class="list-disc list-inside space-y-1 text-sm text-muted-foreground">
										<li>Name-calling</li>
										<li>Public embarrassment</li>
										<li>Use of cane</li>
										<li>Constant comparison</li>
									</ul>
								</div>
							</div>

							<h3 class="text-xl font-semibold mt-6">🎁 Child-Friendly Reward Ideas</h3>
							<ul class="list-disc list-inside space-y-1 ml-4 text-muted-foreground">
								<li>Table or group points</li>
								<li>Star or smiley stickers</li>
								<li>"Homework Leader" or "Reading Captain" badges</li>
								<li>"Class Helper of the Day"</li>
								<li>Short free-time for consistent effort</li>
							</ul>
							<div class="bg-primary/5 p-4 rounded-lg my-4">
								<p class="font-semibold mb-2">Remember:</p>
								<p class="text-sm text-muted-foreground">Motivation inspires learning; fear suppresses it.</p>
							</div>
						</section>

						<section class="space-y-4">
							<h2 class="text-2xl font-bold text-primary">2.5 Behavioral and Emotional Needs of Pupils</h2>
							<p class="text-muted-foreground">Every child is unique. Effective teachers adjust strategies to meet individual needs.</p>
							<div class="overflow-x-auto my-4">
								<table class="min-w-full border-collapse border border-primary/20">
									<thead class="bg-primary/10">
										<tr>
											<th class="border border-primary/20 p-2 text-left text-sm font-semibold">Child Type</th>
											<th class="border border-primary/20 p-2 text-left text-sm font-semibold">Support Strategy</th>
										</tr>
									</thead>
									<tbody class="text-sm">
										<tr>
											<td class="border border-primary/20 p-2 font-medium">Shy</td>
											<td class="border border-primary/20 p-2">Pair with friendly pupils, start with easy tasks, offer gentle praise</td>
										</tr>
										<tr class="bg-muted/30">
											<td class="border border-primary/20 p-2 font-medium">Hyperactive</td>
											<td class="border border-primary/20 p-2">Give short, active tasks; assign roles like "board cleaner" or "materials manager"</td>
										</tr>
										<tr>
											<td class="border border-primary/20 p-2 font-medium">Slow Learner</td>
											<td class="border border-primary/20 p-2">Break lessons into small steps; use visuals and repetition</td>
										</tr>
										<tr class="bg-muted/30">
											<td class="border border-primary/20 p-2 font-medium">Talkative</td>
											<td class="border border-primary/20 p-2">Channel energy into "reporter" or "discussion leader" roles</td>
										</tr>
										<tr>
											<td class="border border-primary/20 p-2 font-medium">Anxious</td>
											<td class="border border-primary/20 p-2">Use calm tones, predictable routines, and reassurance</td>
										</tr>
									</tbody>
								</table>
							</div>
							<div class="bg-primary/5 p-4 rounded-lg my-4">
								<p class="font-semibold mb-2">Teacher mindset:</p>
								<p class="text-sm text-muted-foreground">Behavior is communication. Understand the "why" behind a child's action.</p>
							</div>
						</section>

						<section class="space-y-4">
							<h2 class="text-2xl font-bold text-primary">2.6 Positive Discipline Framework</h2>
							<p class="text-muted-foreground">Positive discipline builds self-control, respect, and responsibility — without fear or pain.</p>
							<div class="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
								<div class="bg-red-50 dark:bg-red-950/20 p-4 rounded-lg border-l-4 border-red-500">
									<h3 class="font-semibold mb-2 text-red-700 dark:text-red-400">🚫 Avoid</h3>
									<ul class="list-disc list-inside space-y-1 text-sm text-muted-foreground">
										<li>Shouting or yelling</li>
										<li>Corporal punishment (cane)</li>
										<li>Sarcasm or ridicule</li>
										<li>Comparing pupils publicly</li>
									</ul>
								</div>
								<div class="bg-green-50 dark:bg-green-950/20 p-4 rounded-lg border-l-4 border-green-500">
									<h3 class="font-semibold mb-2 text-green-700 dark:text-green-400">✅ Do</h3>
									<ul class="list-disc list-inside space-y-1 text-sm text-muted-foreground">
										<li>Speak at the child's eye level</li>
										<li>Set clear expectations and classroom rules together</li>
										<li>Keep consistent routines</li>
										<li>Use soft consequences that teach reflection</li>
									</ul>
								</div>
							</div>
							<div class="bg-primary/5 p-4 rounded-lg my-4">
								<p class="font-semibold mb-2">Example Strategy: The "1–2–3 Calm Rule"</p>
								<ol class="list-decimal list-inside space-y-1 text-sm text-muted-foreground ml-4">
									<li>Calm verbal warning</li>
									<li>Short reflection time (2 minutes, head on desk)</li>
									<li>Quiet conversation to reflect on behavior and solution</li>
								</ol>
								<p class="text-sm text-muted-foreground mt-2">Discipline should correct, not humiliate.</p>
							</div>
						</section>

						<section class="space-y-4">
							<h2 class="text-2xl font-bold text-primary">2.7 Digital Awareness and Screen Behavior</h2>
							<p class="text-muted-foreground">In the modern classroom, children are increasingly exposed to digital tools. Teachers play a vital role in promoting responsible technology use.</p>
							<div class="bg-primary/5 p-4 rounded-lg my-4">
								<h3 class="font-semibold mb-2">Teach Pupils:</h3>
								<ul class="list-disc list-inside space-y-1 text-sm text-muted-foreground">
									<li><strong>Online Safety:</strong> Do not share personal information or chat with strangers</li>
									<li><strong>Positive Tech Use:</strong> Use tablets/computers for learning and creativity</li>
									<li><strong>Zero Tolerance for Cyberbullying</strong></li>
									<li><strong>Balanced Screen Time:</strong> Alternate between online and offline learning</li>
								</ul>
								<p class="text-sm font-medium mt-2">Phrase: "We use tablets to learn — not to fight, gossip, or bully."</p>
							</div>
						</section>
					</div>`
				},
				quiz: [
					{
						question: "The primary school child (ages 6–11) learns best through:",
						options: [
							"Memorizing facts and formulas",
							"Listening quietly to long lectures",
							"Using real objects and practical examples",
							"Watching teachers do the work"
						],
						correctAnswerIndex: 2
					},
					{
						question: "According to Piaget, children aged 7–11 are in which stage of development?",
						options: [
							"Pre-operational stage",
							"Concrete operational stage",
							"Formal operational stage",
							"Sensory-motor stage"
						],
						correctAnswerIndex: 1
					},
					{
						question: "A 7-year-old pupil has an average attention span of:",
						options: [
							"5–8 minutes",
							"20–30 minutes",
							"10–12 minutes",
							"35–40 minutes"
						],
						correctAnswerIndex: 2
					},
					{
						question: "Which of the following is a key characteristic of Lower Primary children (6–8 years)?",
						options: [
							"Fully developed abstract reasoning",
							"High ability to work independently for long",
							"Literal thinking and short attention span",
							"Advanced handwriting and note-taking"
						],
						correctAnswerIndex: 2
					},
					{
						question: "According to Erikson, the main psychosocial task for children aged 6–11 is:",
						options: [
							"Identity vs Role Confusion",
							"Industry vs Inferiority",
							"Autonomy vs Shame",
							"Trust vs Mistrust"
						],
						correctAnswerIndex: 1
					},
					{
						question: "Vygotsky emphasized that children learn best through:",
						options: [
							"Working silently and alone",
							"Memorization and repetition only",
							"Guided interaction and social collaboration",
							"Passive listening to adults"
						],
						correctAnswerIndex: 2
					},
					{
						question: "Which teaching method supports Piaget's view of concrete learning?",
						options: [
							"Long lectures with note copying",
							"Using manipulatives, drawings, and experiments",
							"Assigning abstract homework only",
							"Oral drilling and dictation"
						],
						correctAnswerIndex: 1
					},
					{
						question: "The best way to motivate primary learners is to:",
						options: [
							"Use threats and fear of punishment",
							"Praise effort and improvement regularly",
							"Compare them to their classmates",
							"Give punishment for low scores"
						],
						correctAnswerIndex: 1
					},
					{
						question: "The average attention span of a 9-year-old child is approximately:",
						options: [
							"5 minutes",
							"15–20 minutes",
							"30–45 minutes",
							"60 minutes"
						],
						correctAnswerIndex: 1
					},
					{
						question: "Which of the following is an example of positive motivation?",
						options: [
							"Shouting at pupils who fail",
							"Publicly comparing pupils' grades",
							"Awarding star stickers for effort",
							"Taking away break time"
						],
						correctAnswerIndex: 2
					},
					{
						question: "When a child is shy, the best strategy is to:",
						options: [
							"Ignore them until they participate",
							"Pair them with friendly pupils and start with easy tasks",
							"Call them out in front of the class",
							"Assign them the hardest questions"
						],
						correctAnswerIndex: 1
					},
					{
						question: "What is the most effective response to a pupil who is hyperactive?",
						options: [
							"Yell at the pupil to sit still",
							"Give short, active tasks and assign class roles",
							"Punish them daily",
							"Ignore the behavior completely"
						],
						correctAnswerIndex: 1
					},
					{
						question: "Positive discipline emphasizes:",
						options: [
							"Teaching self-control and respect through calm consistency",
							"Using fear to ensure obedience",
							"Public embarrassment to control class",
							"Immediate punishment for every mistake"
						],
						correctAnswerIndex: 0
					},
					{
						question: "The best way to teach safe digital behavior is to tell children:",
						options: [
							"To spend more hours online",
							"To avoid using technology at all",
							"Use tablets to learn, not to fight or gossip",
							"To share passwords with friends"
						],
						correctAnswerIndex: 2
					},
					{
						question: "A 10-year-old who enjoys taking part in group tasks and comparing results with others is showing:",
						options: [
							"Emotional instability",
							"Social development",
							"Physical fatigue",
							"Language regression"
						],
						correctAnswerIndex: 1
					}
				]
			},
			{
				id: 'p3',
				title: 'Curriculum, Scheme of Work & Lesson Planning (CBC + PLP)',
				description: 'Understand the CBC structure, differentiate between Curriculum, Scheme of Work, and Lesson Plan, design weekly and term-based Schemes of Work, and write CBC-aligned Lesson Plans for both Lower and Upper Primary.',
				content: {
					html: `<div class="space-y-6">
						<div class="bg-primary/5 border-l-4 border-primary p-4 rounded-r-lg">
							<h3 class="font-bold text-lg mb-3 text-primary">🎯 Learning Objectives</h3>
							<p class="text-sm mb-2">By the end of this module, trainees will be able to:</p>
							<ul class="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-4">
								<li>Explain the structure of the Competency-Based Curriculum (CBC) under MINEDUB</li>
								<li>Differentiate between Curriculum, Scheme of Work, and Lesson Plan</li>
								<li>Design weekly and term-based Schemes of Work</li>
								<li>Write CBC-aligned Lesson Plans for both Lower and Upper Primary</li>
								<li>Apply Personalized Learning Plans (PLP) to support all learners</li>
								<li>Formulate clear and measurable Learning Objectives</li>
								<li>Assess lesson outcomes using continuous and formative methods</li>
							</ul>
						</div>

						<section class="space-y-4">
							<h2 class="text-2xl font-bold text-primary">3.1 Understanding the CBC (Competency-Based Curriculum)</h2>
							<p class="text-muted-foreground">The CBC is the national curriculum framework guiding basic education in Cameroon. It emphasizes what a learner can do with the knowledge and skills acquired, not just what they memorize.</p>
							
							<h3 class="text-xl font-semibold mt-6">CBC Pillars and Their Meanings</h3>
							<div class="overflow-x-auto my-4">
								<table class="min-w-full border-collapse border border-primary/20">
									<thead class="bg-primary/10">
										<tr>
											<th class="border border-primary/20 p-2 text-left text-sm font-semibold">Pillar</th>
											<th class="border border-primary/20 p-2 text-left text-sm font-semibold">Meaning / Focus</th>
										</tr>
									</thead>
									<tbody class="text-sm">
										<tr>
											<td class="border border-primary/20 p-2 font-medium">Competency</td>
											<td class="border border-primary/20 p-2">Ability to apply knowledge, skills, and attitudes effectively in real-life situations</td>
										</tr>
										<tr class="bg-muted/30">
											<td class="border border-primary/20 p-2 font-medium">Learning Activities</td>
											<td class="border border-primary/20 p-2">Child-centered, practical, and engaging tasks that promote discovery and participation</td>
										</tr>
										<tr>
											<td class="border border-primary/20 p-2 font-medium">Assessment</td>
											<td class="border border-primary/20 p-2">Continuous, formative evaluation through observation, questioning, and tasks—not just exams</td>
										</tr>
										<tr class="bg-muted/30">
											<td class="border border-primary/20 p-2 font-medium">Values</td>
											<td class="border border-primary/20 p-2">Emphasis on citizenship, respect, moral education, teamwork, and patriotism</td>
										</tr>
										<tr>
											<td class="border border-primary/20 p-2 font-medium">Digital Literacy</td>
											<td class="border border-primary/20 p-2">Use of basic ICT skills and safe digital practices to enhance learning</td>
										</tr>
									</tbody>
								</table>
							</div>
						</section>

						<section class="space-y-4">
							<h2 class="text-2xl font-bold text-primary">3.2 Key Terms and Definitions</h2>
							<div class="overflow-x-auto my-4">
								<table class="min-w-full border-collapse border border-primary/20">
									<thead class="bg-primary/10">
										<tr>
											<th class="border border-primary/20 p-2 text-left text-sm font-semibold">Term</th>
											<th class="border border-primary/20 p-2 text-left text-sm font-semibold">Meaning</th>
										</tr>
									</thead>
									<tbody class="text-sm">
										<tr>
											<td class="border border-primary/20 p-2 font-medium">Curriculum</td>
											<td class="border border-primary/20 p-2">The complete set of subjects, competencies, and learning goals for the entire educational cycle (national framework).</td>
										</tr>
										<tr class="bg-muted/30">
											<td class="border border-primary/20 p-2 font-medium">Scheme of Work</td>
											<td class="border border-primary/20 p-2">A termly or weekly breakdown of the curriculum into manageable teaching units.</td>
										</tr>
										<tr>
											<td class="border border-primary/20 p-2 font-medium">Lesson Plan</td>
											<td class="border border-primary/20 p-2">A detailed outline of what the teacher will teach in one lesson (usually 35–60 minutes).</td>
										</tr>
										<tr class="bg-muted/30">
											<td class="border border-primary/20 p-2 font-medium">PLP (Personalized Learning Plan)</td>
											<td class="border border-primary/20 p-2">A special plan for learners who are struggling or need advanced learning support.</td>
										</tr>
										<tr>
											<td class="border border-primary/20 p-2 font-medium">C.A (Continuous Assessment)</td>
											<td class="border border-primary/20 p-2">Ongoing evaluation of learner progress using classwork, projects, and participation.</td>
										</tr>
									</tbody>
								</table>
							</div>
						</section>

						<section class="space-y-4">
							<h2 class="text-2xl font-bold text-primary">3.3 MINEDUB Timetable Guide</h2>
							<div class="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
								<div class="bg-primary/5 p-4 rounded-lg">
									<h3 class="font-semibold mb-2">Lower Primary (Class 1–3)</h3>
									<p class="text-sm text-muted-foreground mb-2">Subjects include:</p>
									<ul class="list-disc list-inside space-y-1 text-sm text-muted-foreground">
										<li>English</li>
										<li>French</li>
										<li>Mathematics</li>
										<li>Science & Health</li>
										<li>Social Studies</li>
										<li>Physical Education (PE)</li>
										<li>Creative Arts</li>
										<li>ICT (introduction)</li>
									</ul>
								</div>
								<div class="bg-primary/5 p-4 rounded-lg">
									<h3 class="font-semibold mb-2">Upper Primary (Class 4–6)</h3>
									<p class="text-sm text-muted-foreground mb-2">Subjects include:</p>
									<ul class="list-disc list-inside space-y-1 text-sm text-muted-foreground">
										<li>English</li>
										<li>French</li>
										<li>Mathematics</li>
										<li>Science</li>
										<li>ICT (and Coding basics)</li>
										<li>Civic & Moral Education</li>
										<li>History</li>
										<li>Physical Education</li>
										<li>Creative Arts</li>
									</ul>
								</div>
							</div>
							<div class="bg-primary/10 p-4 rounded-lg my-4">
								<p class="font-semibold mb-2">Key Priority Subjects:</p>
								<ul class="list-disc list-inside space-y-1 text-sm">
									<li>✅ English</li>
									<li>✅ Mathematics</li>
									<li>✅ French</li>
								</ul>
							</div>
						</section>

						<section class="space-y-4">
							<h2 class="text-2xl font-bold text-primary">3.4 Scheme of Work Structure</h2>
							<p class="text-muted-foreground">A Scheme of Work provides a roadmap for teaching over a period (term or week). It ensures lessons are systematic, progressive, and aligned with curriculum objectives.</p>
							<div class="bg-primary/5 p-4 rounded-lg my-4">
								<h3 class="font-semibold mb-2">Essential Elements:</h3>
								<ul class="list-disc list-inside space-y-1 text-sm text-muted-foreground">
									<li>Term / Title</li>
									<li>Week Number</li>
									<li>Topic & Subtopic</li>
									<li>Competency or Learning Objective</li>
									<li>Teaching Resources</li>
									<li>Learning Activities</li>
									<li>Assessment Methods</li>
								</ul>
							</div>
							<div class="overflow-x-auto my-4">
								<table class="min-w-full border-collapse border border-primary/20">
									<thead class="bg-primary/10">
										<tr>
											<th class="border border-primary/20 p-2 text-left text-sm font-semibold">Week</th>
											<th class="border border-primary/20 p-2 text-left text-sm font-semibold">Topic</th>
											<th class="border border-primary/20 p-2 text-left text-sm font-semibold">Sub-Topic</th>
											<th class="border border-primary/20 p-2 text-left text-sm font-semibold">Competency</th>
											<th class="border border-primary/20 p-2 text-left text-sm font-semibold">Activities</th>
											<th class="border border-primary/20 p-2 text-left text-sm font-semibold">Assessment</th>
										</tr>
									</thead>
									<tbody class="text-sm">
										<tr>
											<td class="border border-primary/20 p-2">1</td>
											<td class="border border-primary/20 p-2">Numbers</td>
											<td class="border border-primary/20 p-2">Counting up to 500</td>
											<td class="border border-primary/20 p-2">Reads and writes numbers correctly</td>
											<td class="border border-primary/20 p-2">Group counting, use of number cards</td>
											<td class="border border-primary/20 p-2">Oral & written exercises</td>
										</tr>
									</tbody>
								</table>
							</div>
						</section>

						<section class="space-y-4">
							<h2 class="text-2xl font-bold text-primary">3.5 Lesson Plan Format (CBC Standard)</h2>
							<p class="text-muted-foreground">A Lesson Plan translates the scheme of work into a single, actionable teaching session.</p>
							<div class="overflow-x-auto my-4">
								<table class="min-w-full border-collapse border border-primary/20">
									<thead class="bg-primary/10">
										<tr>
											<th class="border border-primary/20 p-2 text-left text-sm font-semibold">Item</th>
											<th class="border border-primary/20 p-2 text-left text-sm font-semibold">Details / Example</th>
										</tr>
									</thead>
									<tbody class="text-sm">
										<tr>
											<td class="border border-primary/20 p-2 font-medium">Class</td>
											<td class="border border-primary/20 p-2">e.g. Primary 2</td>
										</tr>
										<tr class="bg-muted/30">
											<td class="border border-primary/20 p-2 font-medium">Subject</td>
											<td class="border border-primary/20 p-2">English</td>
										</tr>
										<tr>
											<td class="border border-primary/20 p-2 font-medium">Topic</td>
											<td class="border border-primary/20 p-2">Sounds / Phonics</td>
										</tr>
										<tr class="bg-muted/30">
											<td class="border border-primary/20 p-2 font-medium">Competency</td>
											<td class="border border-primary/20 p-2">Reads and pronounces CVC words correctly</td>
										</tr>
										<tr>
											<td class="border border-primary/20 p-2 font-medium">Learning Objectives</td>
											<td class="border border-primary/20 p-2">By the end of the lesson, pupils should identify and read /a/ sound words</td>
										</tr>
										<tr class="bg-muted/30">
											<td class="border border-primary/20 p-2 font-medium">Materials</td>
											<td class="border border-primary/20 p-2">Flashcards, charts, pictures, board</td>
										</tr>
										<tr>
											<td class="border border-primary/20 p-2 font-medium">Lesson Stages</td>
											<td class="border border-primary/20 p-2">Introduction → Development → Assessment</td>
										</tr>
										<tr class="bg-muted/30">
											<td class="border border-primary/20 p-2 font-medium">Assessment</td>
											<td class="border border-primary/20 p-2">Oral reading and writing of CVC words</td>
										</tr>
										<tr>
											<td class="border border-primary/20 p-2 font-medium">Homework</td>
											<td class="border border-primary/20 p-2">Write and read five /a/ words</td>
										</tr>
									</tbody>
								</table>
							</div>
						</section>

						<section class="space-y-4">
							<h2 class="text-2xl font-bold text-primary">3.6 Sample Lesson Plan (Lower Primary)</h2>
							<div class="bg-primary/5 p-4 rounded-lg my-4">
								<p class="font-semibold mb-2">Subject: English | Class: Primary 1 | Topic: Phonics – /a/</p>
								<p class="text-sm text-muted-foreground mb-4">Competency: Identify and pronounce the /a/ sound correctly</p>
								<div class="overflow-x-auto">
									<table class="min-w-full border-collapse border border-primary/20 text-sm">
										<thead class="bg-primary/10">
											<tr>
												<th class="border border-primary/20 p-2 text-left">Lesson Steps</th>
											</tr>
										</thead>
										<tbody>
											<tr>
												<td class="border border-primary/20 p-2">Warm-up (2 min) – Sing ABC phonics song</td>
											</tr>
											<tr class="bg-muted/30">
												<td class="border border-primary/20 p-2">Sound Drill (5 min) – Teacher says /a/, pupils repeat</td>
											</tr>
											<tr>
												<td class="border border-primary/20 p-2">Blending Practice (10 min) – Build words: a–t → at; c–a–t → cat</td>
											</tr>
											<tr class="bg-muted/30">
												<td class="border border-primary/20 p-2">Activity (5 min) – Pupils jump when they hear /a/</td>
											</tr>
											<tr>
												<td class="border border-primary/20 p-2">Assessment (5 min) – Read 3 /a/ words aloud</td>
											</tr>
											<tr class="bg-muted/30">
												<td class="border border-primary/20 p-2">Homework – Write and read: cat, mat, bag</td>
											</tr>
										</tbody>
									</table>
								</div>
							</div>
						</section>

						<section class="space-y-4">
							<h2 class="text-2xl font-bold text-primary">3.7 Sample Lesson Plan (Upper Primary)</h2>
							<div class="bg-primary/5 p-4 rounded-lg my-4">
								<p class="font-semibold mb-2">Subject: Science | Class: Primary 5 | Topic: Hygiene and Disease Prevention</p>
								<p class="text-sm text-muted-foreground mb-4">Competency: Explain methods of preventing malaria</p>
								<div class="overflow-x-auto">
									<table class="min-w-full border-collapse border border-primary/20 text-sm">
										<thead class="bg-primary/10">
											<tr>
												<th class="border border-primary/20 p-2 text-left">Stage</th>
												<th class="border border-primary/20 p-2 text-left">Activity</th>
											</tr>
										</thead>
										<tbody>
											<tr>
												<td class="border border-primary/20 p-2 font-medium">Introduction</td>
												<td class="border border-primary/20 p-2">Ask pupils: "Have you ever seen mosquitoes?"</td>
											</tr>
											<tr class="bg-muted/30">
												<td class="border border-primary/20 p-2 font-medium">Development</td>
												<td class="border border-primary/20 p-2">Teach causes and prevention (use of nets, cleaning surroundings)</td>
											</tr>
											<tr>
												<td class="border border-primary/20 p-2 font-medium">Activity</td>
												<td class="border border-primary/20 p-2">Group role-play: keeping a home mosquito-free</td>
											</tr>
											<tr class="bg-muted/30">
												<td class="border border-primary/20 p-2 font-medium">Evaluation</td>
												<td class="border border-primary/20 p-2">Oral questions (5) to assess understanding</td>
											</tr>
											<tr>
												<td class="border border-primary/20 p-2 font-medium">Homework</td>
												<td class="border border-primary/20 p-2">Draw and label the mosquito life cycle</td>
											</tr>
										</tbody>
									</table>
								</div>
							</div>
						</section>

						<section class="space-y-4">
							<h2 class="text-2xl font-bold text-primary">3.8 Personalized Learning Plan (PLP)</h2>
							<p class="text-muted-foreground">A PLP helps each learner reach their potential. It is used for:</p>
							<div class="bg-primary/5 p-4 rounded-lg my-4">
								<ul class="list-disc list-inside space-y-1 text-sm text-muted-foreground">
									<li>✅ Slow learners</li>
									<li>✅ Pupils with learning difficulties</li>
									<li>✅ Highly gifted learners needing extra challenge</li>
								</ul>
								<h3 class="font-semibold mt-4 mb-2">Strategies for PLP</h3>
								<ul class="list-disc list-inside space-y-1 text-sm text-muted-foreground">
									<li>Extra practice and reading time</li>
									<li>Peer tutoring or group support</li>
									<li>One-on-one teacher feedback</li>
									<li>Use of educational apps or videos</li>
									<li>Encouragement and praise for effort</li>
									<li>Home reinforcement activities</li>
								</ul>
							</div>
						</section>
					</div>`
				},
				quiz: [
					{
						question: "CBC stands for:",
						options: [
							"Community-Based Curriculum",
							"Competency-Based Curriculum",
							"Content-Based Curriculum",
							"Continuous Basic Course"
						],
						correctAnswerIndex: 1
					},
					{
						question: "The main focus of the CBC is:",
						options: [
							"Memorizing facts",
							"Writing long exams",
							"Applying knowledge and skills in real-life situations",
							"Copying notes from the board"
						],
						correctAnswerIndex: 2
					},
					{
						question: "A curriculum represents:",
						options: [
							"One week of teaching",
							"The total learning framework for an education cycle",
							"A single lesson plan",
							"A teacher's personal notes"
						],
						correctAnswerIndex: 1
					},
					{
						question: "A Scheme of Work is used to:",
						options: [
							"Record attendance",
							"Organize lessons by week or term",
							"Assess homework",
							"Replace the timetable"
						],
						correctAnswerIndex: 1
					},
					{
						question: "A Lesson Plan is:",
						options: [
							"A list of school rules",
							"A guide for teaching a single lesson (35–60 minutes)",
							"A test paper",
							"A subject syllabus"
						],
						correctAnswerIndex: 1
					},
					{
						question: "PLP stands for:",
						options: [
							"Personal Learning Practice",
							"Personalized Learning Plan",
							"Pupil Learning Performance",
							"Practical Learning Project"
						],
						correctAnswerIndex: 1
					},
					{
						question: "Continuous Assessment means:",
						options: [
							"One big exam per term",
							"Random grading",
							"Regular evaluation of learning progress",
							"Monthly punishment and rewards"
						],
						correctAnswerIndex: 2
					},
					{
						question: "The CBC emphasizes:",
						options: [
							"Teacher-centered lessons",
							"Child-centered and activity-based learning",
							"Strict memorization",
							"Exam-only assessment"
						],
						correctAnswerIndex: 1
					},
					{
						question: "Which of these is NOT a CBC pillar?",
						options: [
							"Competency",
							"Assessment",
							"Punishment",
							"Values"
						],
						correctAnswerIndex: 2
					},
					{
						question: "In a CBC lesson, the teacher is mainly a:",
						options: [
							"Lecturer",
							"Facilitator and guide",
							"Supervisor only",
							"Timekeeper"
						],
						correctAnswerIndex: 1
					},
					{
						question: "One key feature of a good lesson plan is:",
						options: [
							"Long theoretical notes",
							"Clear learning objectives and steps",
							"Random questions",
							"Teacher monologue"
						],
						correctAnswerIndex: 1
					},
					{
						question: "A Lower Primary lesson should be:",
						options: [
							"Highly abstract",
							"Play-based and interactive",
							"Exam-oriented only",
							"Teacher-dominated"
						],
						correctAnswerIndex: 1
					},
					{
						question: "Personalized Learning helps to:",
						options: [
							"Ignore struggling pupils",
							"Support individual learning needs",
							"Focus only on top students",
							"Reduce teaching time"
						],
						correctAnswerIndex: 1
					},
					{
						question: "The CBC encourages teachers to assess pupils:",
						options: [
							"Only during final exams",
							"Continuously through observation and activities",
							"Once per month",
							"Only by written tests"
						],
						correctAnswerIndex: 1
					},
					{
						question: "The best approach to planning lessons is to:",
						options: [
							"Copy old notes",
							"Link learning objectives, activities, and assessments",
							"Skip warm-up activities",
							"Focus only on exams"
						],
						correctAnswerIndex: 1
					}
				]
			},
			{
				id: 'p4',
				title: 'Teaching Literacy, Phonics & Language Arts',
				description: 'Understand the purpose and structure of literacy teaching in the CBC, apply phonics-based reading methods, teach listening, speaking, reading, and writing as connected skills, and support struggling readers through differentiated instruction.',
				content: {
					html: `<div class="space-y-6">
						<div class="bg-primary/5 border-l-4 border-primary p-4 rounded-r-lg">
							<h3 class="font-bold text-lg mb-3 text-primary">🎯 Learning Objectives</h3>
							<p class="text-sm mb-2">By the end of this module, trainees will be able to:</p>
							<ul class="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-4">
								<li>Understand the purpose and structure of literacy teaching in the CBC</li>
								<li>Apply phonics-based reading methods rather than rote memorization</li>
								<li>Teach listening, speaking, reading, and writing as connected skills</li>
								<li>Design and deliver English lessons from Class 1–6 effectively</li>
								<li>Use shared reading, guided reading, and dictation to strengthen literacy</li>
								<li>Support struggling readers and writers through differentiated instruction</li>
								<li>Assess reading and writing fluency appropriately for each level</li>
							</ul>
						</div>

						<section class="space-y-4">
							<h2 class="text-2xl font-bold text-primary">4.1 WHY LITERACY MATTERS</h2>
							<blockquote class="border-l-4 border-primary/50 pl-4 italic text-muted-foreground mb-4">
								"If a child can read, the child can learn anything."
							</blockquote>
							<p class="text-muted-foreground">Literacy is the foundation of all learning. Every subject—Math, Science, History, or Civic Education—depends on the child's ability to read and comprehend information.</p>
							
							<div class="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
								<div class="bg-green-50 dark:bg-green-950/20 p-4 rounded-lg">
									<h3 class="font-semibold mb-2 text-green-700 dark:text-green-400">Children who read well:</h3>
									<ul class="list-disc list-inside space-y-1 text-sm text-muted-foreground">
										<li>Perform better in all school subjects</li>
										<li>Understand instructions and classwork easily</li>
										<li>Express ideas clearly in speech and writing</li>
										<li>Develop confidence and curiosity</li>
										<li>Learn independently</li>
									</ul>
								</div>
								<div class="bg-red-50 dark:bg-red-950/20 p-4 rounded-lg">
									<h3 class="font-semibold mb-2 text-red-700 dark:text-red-400">Children who read poorly:</h3>
									<ul class="list-disc list-inside space-y-1 text-sm text-muted-foreground">
										<li>Memorize without understanding</li>
										<li>Fear participation or answering questions</li>
										<li>Struggle with written assessments</li>
										<li>Often develop low self-esteem</li>
									</ul>
								</div>
							</div>
						</section>

						<section class="space-y-4">
							<h2 class="text-2xl font-bold text-primary">4.2 COMPONENTS OF PRIMARY LITERACY</h2>
							<p class="text-muted-foreground">Primary literacy teaching in CBC integrates nine key components that build on one another.</p>
							<div class="overflow-x-auto my-4">
								<table class="min-w-full border-collapse border border-primary/20">
									<thead class="bg-primary/10">
										<tr>
											<th class="border border-primary/20 p-2 text-left text-sm font-semibold">Component</th>
											<th class="border border-primary/20 p-2 text-left text-sm font-semibold">Description</th>
											<th class="border border-primary/20 p-2 text-left text-sm font-semibold">Example</th>
										</tr>
									</thead>
									<tbody class="text-sm">
										<tr>
											<td class="border border-primary/20 p-2 font-medium">1. Phonemic Awareness</td>
											<td class="border border-primary/20 p-2">Ability to hear and manipulate individual sounds in words (spoken skill)</td>
											<td class="border border-primary/20 p-2">Teacher claps syllables in "banana": ba-na-na</td>
										</tr>
										<tr class="bg-muted/30">
											<td class="border border-primary/20 p-2 font-medium">2. Phonics</td>
											<td class="border border-primary/20 p-2">Teaching the link between letters and their sounds</td>
											<td class="border border-primary/20 p-2">/c/ + /a/ + /t/ = "cat"</td>
										</tr>
										<tr>
											<td class="border border-primary/20 p-2 font-medium">3. Blending</td>
											<td class="border border-primary/20 p-2">Combining sounds to read a word</td>
											<td class="border border-primary/20 p-2">"p" + "i" + "n" → "pin"</td>
										</tr>
										<tr class="bg-muted/30">
											<td class="border border-primary/20 p-2 font-medium">4. Segmenting</td>
											<td class="border border-primary/20 p-2">Breaking a word into sounds for spelling</td>
											<td class="border border-primary/20 p-2">"dog" → /d/ /o/ /g/</td>
										</tr>
										<tr>
											<td class="border border-primary/20 p-2 font-medium">5. Vocabulary</td>
											<td class="border border-primary/20 p-2">Understanding and using new words</td>
											<td class="border border-primary/20 p-2">Teaching "river" = flowing water</td>
										</tr>
										<tr class="bg-muted/30">
											<td class="border border-primary/20 p-2 font-medium">6. Grammar</td>
											<td class="border border-primary/20 p-2">Knowing sentence structure and correct usage</td>
											<td class="border border-primary/20 p-2">"He runs" not "He run"</td>
										</tr>
										<tr>
											<td class="border border-primary/20 p-2 font-medium">7. Fluency</td>
											<td class="border border-primary/20 p-2">Reading smoothly with correct pace and expression</td>
											<td class="border border-primary/20 p-2">Avoid word-by-word halting reading</td>
										</tr>
										<tr class="bg-muted/30">
											<td class="border border-primary/20 p-2 font-medium">8. Comprehension</td>
											<td class="border border-primary/20 p-2">Understanding and responding to what is read</td>
											<td class="border border-primary/20 p-2">Answering "Who? What? Why?" questions</td>
										</tr>
										<tr>
											<td class="border border-primary/20 p-2 font-medium">9. Writing</td>
											<td class="border border-primary/20 p-2">Communicating through letters, words, and sentences</td>
											<td class="border border-primary/20 p-2">Copying → guided → independent writing</td>
										</tr>
									</tbody>
								</table>
							</div>
						</section>

						<section class="space-y-4">
							<h2 class="text-2xl font-bold text-primary">4.3 THE PHONICS METHOD (CBC-ALIGNED)</h2>
							<p class="text-muted-foreground">Phonics emphasizes sounds before names. Children learn how letters sound, not how they are called.</p>
							<div class="bg-primary/5 p-4 rounded-lg my-4">
								<h3 class="font-semibold mb-2">Phonics Teaching Steps</h3>
								<ol class="list-decimal list-inside space-y-1 text-sm text-muted-foreground ml-4">
									<li>Introduce the sound: Teacher says the sound clearly (/m/)</li>
									<li>Show a picture: e.g., mango</li>
									<li>Use flashcards and songs for memory</li>
									<li>Pupils trace and write the letter while repeating the sound</li>
									<li>Blend sounds to make words (m-a-t)</li>
									<li>Read and write simple words</li>
									<li>Move to short sentences</li>
								</ol>
								<p class="text-sm font-medium mt-2">🗣 Teacher cue: "Say the sound /b/ as in ball."</p>
								<p class="text-sm font-medium">🧒 Pupil response: "/b/ — ball!"</p>
								<p class="text-sm text-muted-foreground mt-2">CBC Expectation: Each literacy lesson must have active participation (listening, saying, reading, writing).</p>
							</div>
						</section>

						<section class="space-y-4">
							<h2 class="text-2xl font-bold text-primary">4.4 CVC WORDS (VERY IMPORTANT)</h2>
							<p class="text-muted-foreground">CVC = Consonant–Vowel–Consonant. These are the first decodable words for beginner readers.</p>
							<div class="overflow-x-auto my-4">
								<table class="min-w-full border-collapse border border-primary/20">
									<thead class="bg-primary/10">
										<tr>
											<th class="border border-primary/20 p-2 text-left text-sm font-semibold">a</th>
											<th class="border border-primary/20 p-2 text-left text-sm font-semibold">e</th>
											<th class="border border-primary/20 p-2 text-left text-sm font-semibold">i</th>
											<th class="border border-primary/20 p-2 text-left text-sm font-semibold">o</th>
											<th class="border border-primary/20 p-2 text-left text-sm font-semibold">u</th>
										</tr>
									</thead>
									<tbody class="text-sm">
										<tr>
											<td class="border border-primary/20 p-2">cat</td>
											<td class="border border-primary/20 p-2">bed</td>
											<td class="border border-primary/20 p-2">pin</td>
											<td class="border border-primary/20 p-2">pot</td>
											<td class="border border-primary/20 p-2">sun</td>
										</tr>
										<tr class="bg-muted/30">
											<td class="border border-primary/20 p-2">mat</td>
											<td class="border border-primary/20 p-2">pen</td>
											<td class="border border-primary/20 p-2">sit</td>
											<td class="border border-primary/20 p-2">dog</td>
											<td class="border border-primary/20 p-2">cup</td>
										</tr>
										<tr>
											<td class="border border-primary/20 p-2">bat</td>
											<td class="border border-primary/20 p-2">net</td>
											<td class="border border-primary/20 p-2">tip</td>
											<td class="border border-primary/20 p-2">hop</td>
											<td class="border border-primary/20 p-2">bus</td>
										</tr>
									</tbody>
								</table>
							</div>
							<div class="bg-primary/5 p-4 rounded-lg my-4">
								<p class="font-semibold mb-2">Blending example:</p>
								<p class="text-sm text-muted-foreground">Teacher: "s–a–t" → Pupils: "sat!"</p>
								<p class="font-semibold mt-2 mb-2">Game ideas:</p>
								<ul class="list-disc list-inside space-y-1 text-sm text-muted-foreground">
									<li>Sound Hop: Pupils jump for each sound</li>
									<li>Word Race: Two groups blend words aloud</li>
								</ul>
							</div>
						</section>

						<section class="space-y-4">
							<h2 class="text-2xl font-bold text-primary">4.5 SIGHT WORDS (HIGH-FREQUENCY WORDS)</h2>
							<p class="text-muted-foreground">Sight words appear frequently in reading materials but cannot easily be sounded out. They must be memorized by sight.</p>
							<div class="bg-primary/5 p-4 rounded-lg my-4">
								<p class="font-semibold mb-2">Common Sight Words (Class 1–3):</p>
								<p class="text-sm text-muted-foreground">the, is, are, you, we, to, do, of, was, said, come, they, she, he, have, little, one, some, two, where, there</p>
								<h3 class="font-semibold mt-4 mb-2">Teaching Tips:</h3>
								<ul class="list-disc list-inside space-y-1 text-sm text-muted-foreground">
									<li>Use flashcards and games (e.g., "Find the word!")</li>
									<li>Build sentences with sight words daily</li>
									<li>Create a "Word Wall" in class for reference</li>
								</ul>
							</div>
						</section>

						<section class="space-y-4">
							<h2 class="text-2xl font-bold text-primary">4.6 READING PROGRESSION BY CLASS LEVEL</h2>
							<div class="overflow-x-auto my-4">
								<table class="min-w-full border-collapse border border-primary/20">
									<thead class="bg-primary/10">
										<tr>
											<th class="border border-primary/20 p-2 text-left text-sm font-semibold">Class</th>
											<th class="border border-primary/20 p-2 text-left text-sm font-semibold">Expected Skills</th>
											<th class="border border-primary/20 p-2 text-left text-sm font-semibold">Sample Activity</th>
										</tr>
									</thead>
									<tbody class="text-sm">
										<tr>
											<td class="border border-primary/20 p-2 font-medium">Class 1</td>
											<td class="border border-primary/20 p-2">Letter sounds, simple words, short sentences</td>
											<td class="border border-primary/20 p-2">Identify /a/ words in pictures</td>
										</tr>
										<tr class="bg-muted/30">
											<td class="border border-primary/20 p-2 font-medium">Class 2</td>
											<td class="border border-primary/20 p-2">Blends and digraphs (sh, ch, th)</td>
											<td class="border border-primary/20 p-2">Word sorting: ship–chin–thin</td>
										</tr>
										<tr>
											<td class="border border-primary/20 p-2 font-medium">Class 3</td>
											<td class="border border-primary/20 p-2">Reading fluency, short paragraphs</td>
											<td class="border border-primary/20 p-2">Paired reading stories</td>
										</tr>
										<tr class="bg-muted/30">
											<td class="border border-primary/20 p-2 font-medium">Class 4–6</td>
											<td class="border border-primary/20 p-2">Reading comprehension, inference, summary</td>
											<td class="border border-primary/20 p-2">Passage reading and WH questions</td>
										</tr>
									</tbody>
								</table>
							</div>
						</section>

						<section class="space-y-4">
							<h2 class="text-2xl font-bold text-primary">4.7 WRITING SKILLS DEVELOPMENT</h2>
							<p class="text-muted-foreground">Writing begins as a physical and mental coordination skill.</p>
							<div class="bg-primary/5 p-4 rounded-lg my-4">
								<h3 class="font-semibold mb-2">Stages of Writing</h3>
								<ol class="list-decimal list-inside space-y-1 text-sm text-muted-foreground ml-4">
									<li>Tracing – forming letters along dotted lines</li>
									<li>Copying – copying short words and sentences</li>
									<li>Guided writing – teacher provides model sentences</li>
									<li>Independent writing – pupils compose on their own</li>
									<li>Creative writing – storytelling, descriptions, simple essays</li>
								</ol>
								<h3 class="font-semibold mt-4 mb-2">Handwriting Rules</h3>
								<ul class="list-disc list-inside space-y-1 text-sm text-muted-foreground">
									<li>✍🏽 Proper pencil grip</li>
									<li>📏 Write neatly on ruled lines</li>
									<li>🕐 Practice daily (10–15 minutes)</li>
									<li>💬 Encourage proper posture and spacing</li>
								</ul>
							</div>
						</section>

						<section class="space-y-4">
							<h2 class="text-2xl font-bold text-primary">4.8 GRAMMAR IN LANGUAGE ARTS</h2>
							<div class="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
								<div class="bg-primary/5 p-4 rounded-lg">
									<h3 class="font-semibold mb-2">Lower Primary:</h3>
									<ul class="list-disc list-inside space-y-1 text-sm text-muted-foreground">
										<li>Nouns, verbs, adjectives, plurals, simple tenses</li>
										<li>Sentences: subject + verb + object (e.g., "The boy runs fast.")</li>
									</ul>
								</div>
								<div class="bg-primary/5 p-4 rounded-lg">
									<h3 class="font-semibold mb-2">Upper Primary:</h3>
									<ul class="list-disc list-inside space-y-1 text-sm text-muted-foreground">
										<li>Adverbs, conjunctions, pronouns, prepositions</li>
										<li>Punctuation: capital letters, commas, full stops, question marks</li>
										<li>Paragraph structure and short essays</li>
									</ul>
								</div>
							</div>
							<div class="bg-primary/5 p-4 rounded-lg my-4">
								<p class="font-semibold mb-2">Teaching Grammar the CBC Way:</p>
								<p class="text-sm text-muted-foreground">Grammar is not taught in isolation—integrate it through reading, writing, and speaking activities.</p>
							</div>
						</section>

						<section class="space-y-4">
							<h2 class="text-2xl font-bold text-primary">4.9 LITERACY TEACHING STRATEGIES & ACTIVITIES</h2>
							<div class="overflow-x-auto my-4">
								<table class="min-w-full border-collapse border border-primary/20">
									<thead class="bg-primary/10">
										<tr>
											<th class="border border-primary/20 p-2 text-left text-sm font-semibold">Activity</th>
											<th class="border border-primary/20 p-2 text-left text-sm font-semibold">Purpose</th>
											<th class="border border-primary/20 p-2 text-left text-sm font-semibold">Example</th>
										</tr>
									</thead>
									<tbody class="text-sm">
										<tr>
											<td class="border border-primary/20 p-2 font-medium">Shared Reading</td>
											<td class="border border-primary/20 p-2">Builds comprehension—teacher reads aloud, pupils follow</td>
											<td class="border border-primary/20 p-2">"The Lion and the Mouse"</td>
										</tr>
										<tr class="bg-muted/30">
											<td class="border border-primary/20 p-2 font-medium">Guided Reading</td>
											<td class="border border-primary/20 p-2">Small groups read with teacher guidance</td>
											<td class="border border-primary/20 p-2">Discuss main idea</td>
										</tr>
										<tr>
											<td class="border border-primary/20 p-2 font-medium">Phonics Song</td>
											<td class="border border-primary/20 p-2">Reinforces sound memory</td>
											<td class="border border-primary/20 p-2">"A says /a/, A says /a/, apple starts with A!"</td>
										</tr>
										<tr class="bg-muted/30">
											<td class="border border-primary/20 p-2 font-medium">Flashcards</td>
											<td class="border border-primary/20 p-2">Vocabulary building and sight word recall</td>
											<td class="border border-primary/20 p-2">Match picture to word</td>
										</tr>
										<tr>
											<td class="border border-primary/20 p-2 font-medium">Dictation</td>
											<td class="border border-primary/20 p-2">Improves spelling and listening</td>
											<td class="border border-primary/20 p-2">Teacher reads: "The dog ran fast."</td>
										</tr>
										<tr class="bg-muted/30">
											<td class="border border-primary/20 p-2 font-medium">Story Retell</td>
											<td class="border border-primary/20 p-2">Strengthens comprehension and speaking</td>
											<td class="border border-primary/20 p-2">Pupils retell a short story</td>
										</tr>
										<tr>
											<td class="border border-primary/20 p-2 font-medium">Paired Reading</td>
											<td class="border border-primary/20 p-2">Builds fluency and peer support</td>
											<td class="border border-primary/20 p-2">One reads, one listens</td>
										</tr>
										<tr class="bg-muted/30">
											<td class="border border-primary/20 p-2 font-medium">Copy Work</td>
											<td class="border border-primary/20 p-2">Develops handwriting and grammar awareness</td>
											<td class="border border-primary/20 p-2">Copy two sentences daily</td>
										</tr>
									</tbody>
								</table>
							</div>
						</section>

						<section class="space-y-4">
							<h2 class="text-2xl font-bold text-primary">4.10 REMEDIAL SUPPORT TECHNIQUES</h2>
							<p class="text-muted-foreground">Children progress at different rates. Teachers must identify those who struggle and offer Personalized Learning Support (PLP).</p>
							<div class="bg-primary/5 p-4 rounded-lg my-4">
								<h3 class="font-semibold mb-2">For Struggling Readers:</h3>
								<ul class="list-disc list-inside space-y-1 text-sm text-muted-foreground">
									<li>Review letter sounds slowly</li>
									<li>Use picture-word cards</li>
									<li>Practice one-on-one daily for 5 minutes</li>
									<li>Praise even small progress</li>
									<li>Pair them with confident readers</li>
								</ul>
								<p class="text-sm font-medium mt-2">Teacher language:</p>
								<p class="text-sm text-green-600 dark:text-green-400">✅ "You're improving every day."</p>
								<p class="text-sm text-red-600 dark:text-red-400">🚫 Avoid: "You're too slow."</p>
								<p class="text-sm text-muted-foreground mt-2">Remember: Confidence comes before competence.</p>
							</div>
						</section>
					</div>`
				},
				quiz: [
					{
						question: "What is the ultimate goal of literacy teaching?",
						options: [
							"To help pupils memorize English passages",
							"To develop reading, writing, and understanding skills",
							"To make handwriting beautiful only",
							"To prepare for spelling bees"
						],
						correctAnswerIndex: 1
					},
					{
						question: "According to CBC, which approach best develops reading?",
						options: [
							"Memorizing storybooks",
							"Phonics — learning letter sounds",
							"Silent reading only",
							"Grammar drills"
						],
						correctAnswerIndex: 1
					},
					{
						question: "Which component comes first in learning to read?",
						options: [
							"Vocabulary",
							"Comprehension",
							"Phonemic awareness",
							"Writing"
						],
						correctAnswerIndex: 2
					},
					{
						question: "What does CVC stand for?",
						options: [
							"Consonant–Vowel–Consonant",
							"Child–Verb–Concept",
							"Common Vocabulary Category",
							"Class–Verb–Consonant"
						],
						correctAnswerIndex: 0
					},
					{
						question: "Which of the following is a CVC word?",
						options: [
							"tree",
							"shop",
							"cat",
							"book"
						],
						correctAnswerIndex: 2
					},
					{
						question: "What are sight words?",
						options: [
							"Words that can easily be sounded out",
							"Words that must be recognized by sight",
							"New vocabulary words from stories",
							"Difficult spelling words only"
						],
						correctAnswerIndex: 1
					},
					{
						question: "What is blending in phonics?",
						options: [
							"Mixing paint colors",
							"Joining sounds to make a word",
							"Breaking a word apart",
							"Reading silently"
						],
						correctAnswerIndex: 1
					},
					{
						question: "What is segmenting?",
						options: [
							"Joining sounds",
							"Dividing words into sounds",
							"Drawing letters",
							"Reading fluently"
						],
						correctAnswerIndex: 1
					},
					{
						question: "Which teaching method best supports comprehension?",
						options: [
							"Shared reading",
							"Copying sentences",
							"Singing songs only",
							"Grammar dictation"
						],
						correctAnswerIndex: 0
					},
					{
						question: "Which of these supports struggling readers?",
						options: [
							"Giving them extra homework",
							"One-on-one guided reading",
							"Asking them to read alone in front of the class",
							"Ignoring errors"
						],
						correctAnswerIndex: 1
					},
					{
						question: "What is the purpose of dictation?",
						options: [
							"To fill time",
							"To improve spelling and listening",
							"To punish slow learners",
							"To test handwriting only"
						],
						correctAnswerIndex: 1
					},
					{
						question: "At what stage does a pupil begin to write independently?",
						options: [
							"After guided writing",
							"After tracing letters",
							"Before knowing letter sounds",
							"After creative writing"
						],
						correctAnswerIndex: 0
					},
					{
						question: "What should teachers do when pupils read slowly?",
						options: [
							"Compare them with others",
							"Praise small progress and reteach patiently",
							"Move them to a lower class",
							"Avoid giving reading tasks"
						],
						correctAnswerIndex: 1
					},
					{
						question: "Which activity builds vocabulary effectively?",
						options: [
							"Flashcards, storytelling, and games",
							"Grammar correction only",
							"Writing without reading",
							"Memorizing alphabet order"
						],
						correctAnswerIndex: 0
					},
					{
						question: "Why is phonics preferred to word memorization?",
						options: [
							"It is faster to teach",
							"It allows pupils to decode new words independently",
							"It uses fewer materials",
							"It is fun but not useful"
						],
						correctAnswerIndex: 1
					}
				]
			},
			{
				id: 'p5',
				title: 'Teaching Numeracy & Mathematics (CBC)',
				description: 'Understand the CBC approach to teaching numeracy, teach basic number concepts, operations, and problem-solving skills, develop logical thinking and reasoning, and support pupils who struggle with numeracy through remedial strategies.',
				content: {
					html: `<div class="space-y-6">
						<div class="bg-primary/5 border-l-4 border-primary p-4 rounded-r-lg">
							<h3 class="font-bold text-lg mb-3 text-primary">🎯 Learning Objectives</h3>
							<p class="text-sm mb-2">By the end of this module, trainees will be able to:</p>
							<ul class="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-4">
								<li>Understand the CBC approach to teaching numeracy in primary school</li>
								<li>Teach basic number concepts, operations, and problem-solving skills</li>
								<li>Develop logical thinking, reasoning, and application in real-life contexts</li>
								<li>Use hands-on and activity-based learning to teach math concepts</li>
								<li>Support pupils who struggle with numeracy through remedial strategies</li>
								<li>Assess numeracy competence continuously and meaningfully</li>
							</ul>
						</div>

						<section class="space-y-4">
							<h2 class="text-2xl font-bold text-primary">5.1 WHY NUMERACY MATTERS</h2>
							<blockquote class="border-l-4 border-primary/50 pl-4 italic text-muted-foreground mb-4">
								"Mathematics is not just about numbers; it is about thinking logically, solving problems, and understanding the world."
							</blockquote>
							<div class="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
								<div class="bg-green-50 dark:bg-green-950/20 p-4 rounded-lg">
									<h3 class="font-semibold mb-2 text-green-700 dark:text-green-400">Benefits of strong numeracy:</h3>
									<ul class="list-disc list-inside space-y-1 text-sm text-muted-foreground">
										<li>Develops logical reasoning and problem-solving skills</li>
										<li>Supports understanding in science, technology, and daily life</li>
										<li>Improves confidence in school performance</li>
										<li>Encourages independent thinking</li>
									</ul>
								</div>
								<div class="bg-red-50 dark:bg-red-950/20 p-4 rounded-lg">
									<h3 class="font-semibold mb-2 text-red-700 dark:text-red-400">Challenges in learning math:</h3>
									<ul class="list-disc list-inside space-y-1 text-sm text-muted-foreground">
										<li>Memorization without understanding</li>
										<li>Fear or anxiety toward numbers ("Math phobia")</li>
										<li>Lack of real-life application</li>
									</ul>
								</div>
							</div>
							<div class="bg-primary/5 p-4 rounded-lg my-4">
								<p class="font-semibold mb-2">CBC Philosophy:</p>
								<p class="text-sm text-muted-foreground">Children learn math by doing, seeing, and exploring, not by rote memorization.</p>
							</div>
						</section>

						<section class="space-y-4">
							<h2 class="text-2xl font-bold text-primary">5.2 NUMERACY COMPONENTS IN PRIMARY SCHOOL</h2>
							<div class="overflow-x-auto my-4">
								<table class="min-w-full border-collapse border border-primary/20">
									<thead class="bg-primary/10">
										<tr>
											<th class="border border-primary/20 p-2 text-left text-sm font-semibold">Component</th>
											<th class="border border-primary/20 p-2 text-left text-sm font-semibold">Description</th>
											<th class="border border-primary/20 p-2 text-left text-sm font-semibold">Examples/Activities</th>
										</tr>
									</thead>
									<tbody class="text-sm">
										<tr>
											<td class="border border-primary/20 p-2 font-medium">Number Sense</td>
											<td class="border border-primary/20 p-2">Understanding numbers, counting, place value</td>
											<td class="border border-primary/20 p-2">Count objects, group in tens, hundreds</td>
										</tr>
										<tr class="bg-muted/30">
											<td class="border border-primary/20 p-2 font-medium">Operations</td>
											<td class="border border-primary/20 p-2">Addition, subtraction, multiplication, division</td>
											<td class="border border-primary/20 p-2">Solve practical problems: 3 + 4 apples = ?</td>
										</tr>
										<tr>
											<td class="border border-primary/20 p-2 font-medium">Patterns & Sequences</td>
											<td class="border border-primary/20 p-2">Recognize repetition, predict next numbers</td>
											<td class="border border-primary/20 p-2">Odd/even numbers, skip counting</td>
										</tr>
										<tr class="bg-muted/30">
											<td class="border border-primary/20 p-2 font-medium">Measurement</td>
											<td class="border border-primary/20 p-2">Length, weight, capacity, time</td>
											<td class="border border-primary/20 p-2">Measure classroom objects, weigh items</td>
										</tr>
										<tr>
											<td class="border border-primary/20 p-2 font-medium">Geometry</td>
											<td class="border border-primary/20 p-2">Shapes, space, symmetry</td>
											<td class="border border-primary/20 p-2">Identify triangles, draw shapes, tangram puzzles</td>
										</tr>
										<tr class="bg-muted/30">
											<td class="border border-primary/20 p-2 font-medium">Data Handling</td>
											<td class="border border-primary/20 p-2">Collect, organize, interpret information</td>
											<td class="border border-primary/20 p-2">Count and graph favorite fruits</td>
										</tr>
										<tr>
											<td class="border border-primary/20 p-2 font-medium">Problem-Solving</td>
											<td class="border border-primary/20 p-2">Apply math to real-life situations</td>
											<td class="border border-primary/20 p-2">"If I have 5 oranges and eat 2, how many left?"</td>
										</tr>
										<tr class="bg-muted/30">
											<td class="border border-primary/20 p-2 font-medium">Logical Thinking</td>
											<td class="border border-primary/20 p-2">Reasoning, classifying, comparing</td>
											<td class="border border-primary/20 p-2">Sorting objects by color, size, or type</td>
										</tr>
									</tbody>
								</table>
							</div>
						</section>

						<section class="space-y-4">
							<h2 class="text-2xl font-bold text-primary">5.3 AGE-SPECIFIC CONSIDERATIONS</h2>
							<div class="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
								<div class="bg-primary/5 p-4 rounded-lg">
									<h3 class="font-semibold mb-2">Lower Primary (6–8 years, Classes 1–3):</h3>
									<ul class="list-disc list-inside space-y-1 text-sm text-muted-foreground">
										<li>Focus on counting, basic operations, patterns, simple measurement</li>
										<li>Use concrete objects (blocks, sticks, beads)</li>
										<li>Activities: Number games, matching, sorting</li>
									</ul>
								</div>
								<div class="bg-primary/5 p-4 rounded-lg">
									<h3 class="font-semibold mb-2">Upper Primary (9–11 years, Classes 4–6):</h3>
									<ul class="list-disc list-inside space-y-1 text-sm text-muted-foreground">
										<li>Focus on multi-step problems, fractions, geometry, decimals</li>
										<li>Begin abstract reasoning but continue hands-on examples</li>
										<li>Activities: Problem-solving projects, real-life scenarios, story problems</li>
									</ul>
								</div>
							</div>
							<div class="bg-primary/5 p-4 rounded-lg my-4">
								<p class="font-semibold mb-2">Teacher tip:</p>
								<p class="text-sm text-muted-foreground">Always link numbers to real-life situations (e.g., money, time, shopping).</p>
							</div>
						</section>

						<section class="space-y-4">
							<h2 class="text-2xl font-bold text-primary">5.4 CBC APPROACH TO TEACHING MATHEMATICS</h2>
							<div class="bg-primary/5 p-4 rounded-lg my-4">
								<ul class="list-disc list-inside space-y-2 text-sm text-muted-foreground">
									<li><strong>Learner-centered:</strong> Pupils manipulate objects and participate actively</li>
									<li><strong>Hands-on activities:</strong> Use counters, beads, shapes, blocks, measuring tools</li>
									<li><strong>Problem-solving focus:</strong> Encourage thinking, reasoning, and explanations</li>
									<li><strong>Competency-based outcomes:</strong> Pupils must demonstrate what they can do with numbers</li>
									<li><strong>Continuous assessment:</strong> Observe, question, and give practical tasks rather than relying solely on exams</li>
								</ul>
							</div>
							<div class="bg-primary/10 p-4 rounded-lg my-4">
								<p class="font-semibold mb-2">Examples of CBC Learning Outcomes:</p>
								<ul class="list-disc list-inside space-y-1 text-sm">
									<li>"Pupil can add numbers up to 100 using objects."</li>
									<li>"Pupil can measure classroom items in centimeters."</li>
									<li>"Pupil can solve a simple story problem independently."</li>
								</ul>
							</div>
						</section>

						<section class="space-y-4">
							<h2 class="text-2xl font-bold text-primary">5.5 TEACHING STRATEGIES & ACTIVITIES</h2>
							<div class="overflow-x-auto my-4">
								<table class="min-w-full border-collapse border border-primary/20">
									<thead class="bg-primary/10">
										<tr>
											<th class="border border-primary/20 p-2 text-left text-sm font-semibold">Strategy</th>
											<th class="border border-primary/20 p-2 text-left text-sm font-semibold">Description</th>
											<th class="border border-primary/20 p-2 text-left text-sm font-semibold">Classroom Example</th>
										</tr>
									</thead>
									<tbody class="text-sm">
										<tr>
											<td class="border border-primary/20 p-2 font-medium">Concrete–Pictorial–Abstract (CPA)</td>
											<td class="border border-primary/20 p-2">Start with objects → pictures → numbers</td>
											<td class="border border-primary/20 p-2">Count 5 pencils → draw 5 pencils → write 5</td>
										</tr>
										<tr class="bg-muted/30">
											<td class="border border-primary/20 p-2 font-medium">Math Games</td>
											<td class="border border-primary/20 p-2">Make learning fun, reinforce concepts</td>
											<td class="border border-primary/20 p-2">Hopscotch counting, number bingo</td>
										</tr>
										<tr>
											<td class="border border-primary/20 p-2 font-medium">Story Problems</td>
											<td class="border border-primary/20 p-2">Apply math to daily life</td>
											<td class="border border-primary/20 p-2">"If you have 3 bananas and buy 2 more…"</td>
										</tr>
										<tr class="bg-muted/30">
											<td class="border border-primary/20 p-2 font-medium">Group Work & Peer Learning</td>
											<td class="border border-primary/20 p-2">Pupils solve problems collaboratively</td>
											<td class="border border-primary/20 p-2">Build shapes using sticks in groups</td>
										</tr>
										<tr>
											<td class="border border-primary/20 p-2 font-medium">Use of Technology</td>
											<td class="border border-primary/20 p-2">Tablet apps, virtual manipulatives</td>
											<td class="border border-primary/20 p-2">Count objects or play fraction games online</td>
										</tr>
										<tr class="bg-muted/30">
											<td class="border border-primary/20 p-2 font-medium">Math Journals</td>
											<td class="border border-primary/20 p-2">Pupils record learning</td>
											<td class="border border-primary/20 p-2">Write 2 addition problems solved during class</td>
										</tr>
									</tbody>
								</table>
							</div>
						</section>

						<section class="space-y-4">
							<h2 class="text-2xl font-bold text-primary">5.6 ASSESSMENT TECHNIQUES</h2>
							<div class="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
								<div class="bg-primary/5 p-4 rounded-lg">
									<h3 class="font-semibold mb-2">Formative Assessment (during learning):</h3>
									<ul class="list-disc list-inside space-y-1 text-sm text-muted-foreground">
										<li>Observe pupils' problem-solving approach</li>
										<li>Ask probing questions: "Why did you choose that number?"</li>
										<li>Use small tasks or whiteboards for instant feedback</li>
									</ul>
								</div>
								<div class="bg-primary/5 p-4 rounded-lg">
									<h3 class="font-semibold mb-2">Summative Assessment (end of lesson/unit):</h3>
									<ul class="list-disc list-inside space-y-1 text-sm text-muted-foreground">
										<li>Worksheets and exercises</li>
										<li>Oral questioning</li>
										<li>Group projects (e.g., measure classroom items, graph fruits)</li>
									</ul>
								</div>
							</div>
							<div class="bg-primary/5 p-4 rounded-lg my-4">
								<p class="font-semibold mb-2">CBC Tip:</p>
								<p class="text-sm text-muted-foreground">Assessment should focus on application and understanding, not just memorization.</p>
							</div>
						</section>

						<section class="space-y-4">
							<h2 class="text-2xl font-bold text-primary">5.7 REMEDIAL SUPPORT STRATEGIES</h2>
							<p class="text-muted-foreground">For pupils who struggle with math:</p>
							<div class="bg-primary/5 p-4 rounded-lg my-4">
								<ul class="list-disc list-inside space-y-1 text-sm text-muted-foreground">
									<li>Use counters, beads, or real-life objects</li>
									<li>Give small, incremental steps for addition/subtraction</li>
									<li>Use peer tutoring</li>
									<li>Give extra practice and repetition</li>
									<li>Praise efforts, not just correct answers</li>
								</ul>
								<p class="text-sm font-medium mt-2">Avoid saying: "Math is too hard for you."</p>
								<p class="text-sm font-medium text-green-600 dark:text-green-400">Instead: "Let's solve this step by step — you are improving!"</p>
							</div>
						</section>
					</div>`
				},
				quiz: [
					{
						question: "What is the main goal of CBC numeracy teaching?",
						options: [
							"Memorize number facts only",
							"Pupils demonstrate understanding and apply concepts",
							"Complete worksheets quickly",
							"Read math textbooks silently"
						],
						correctAnswerIndex: 1
					},
					{
						question: "Which approach helps pupils understand math concepts best?",
						options: [
							"Concrete–Pictorial–Abstract (CPA)",
							"Memorization only",
							"Silent reading",
							"Long lectures"
						],
						correctAnswerIndex: 0
					},
					{
						question: "Which skill is introduced first in Lower Primary?",
						options: [
							"Fractions",
							"Place value and counting",
							"Decimals",
							"Geometry"
						],
						correctAnswerIndex: 1
					},
					{
						question: "What is a good example of a story problem?",
						options: [
							"3 + 2 = ?",
							"Read a paragraph silently",
							"Write numbers 1–10",
							"Copy sums from board"
						],
						correctAnswerIndex: 0
					},
					{
						question: "Which is a CBC assessment method?",
						options: [
							"Continuous observation",
							"Only end-of-term exams",
							"Punishment for wrong answers",
							"Ignoring errors"
						],
						correctAnswerIndex: 0
					},
					{
						question: "What should a remedial strategy for math include?",
						options: [
							"Punishment",
							"Step-by-step guidance using objects",
							"Ignoring the child",
							"Giving only advanced tasks"
						],
						correctAnswerIndex: 1
					},
					{
						question: "Which classroom activity builds logical thinking?",
						options: [
							"Sorting objects by size",
							"Reading silently",
							"Writing dictated sentences",
							"Singing rhymes"
						],
						correctAnswerIndex: 0
					},
					{
						question: "How can fractions be taught to Upper Primary pupils?",
						options: [
							"Using drawings and objects",
							"Memorizing fraction rules only",
							"Writing fractions without understanding",
							"Reciting fraction names"
						],
						correctAnswerIndex: 0
					},
					{
						question: "What is an example of a measurement activity?",
						options: [
							"Count to 50",
							"Measure desk lengths using a ruler",
							"Recite times tables",
							"Draw shapes randomly"
						],
						correctAnswerIndex: 1
					},
					{
						question: "Which method encourages pupil participation in math?",
						options: [
							"Group work and hands-on activities",
							"Teacher lectures only",
							"Silent copying",
							"Individual punishment"
						],
						correctAnswerIndex: 0
					},
					{
						question: "What is the purpose of math games in CBC?",
						options: [
							"Fill time",
							"Engage pupils while reinforcing concepts",
							"Reward only high achievers",
							"Avoid teaching content"
						],
						correctAnswerIndex: 1
					},
					{
						question: "How can a teacher check understanding during a lesson?",
						options: [
							"Observe pupils and ask probing questions",
							"Wait until exams",
							"Only assign homework",
							"Compare pupils publicly"
						],
						correctAnswerIndex: 0
					},
					{
						question: "What is the correct use of counters in Lower Primary?",
						options: [
							"Counting objects for addition/subtraction",
							"Writing words",
							"Memorizing facts only",
							"Ignoring counting"
						],
						correctAnswerIndex: 0
					},
					{
						question: "Which problem is appropriate for Primary 5?",
						options: [
							"1 + 1 = ?",
							"Divide a cake into 4 parts and eat 1/4",
							"Count 1–10",
							"Trace letters"
						],
						correctAnswerIndex: 1
					},
					{
						question: "Why is CBC numeracy different from traditional methods?",
						options: [
							"Emphasizes memorization",
							"Focuses on what pupils can do and apply",
							"Only gives worksheets",
							"Ignores problem-solving"
						],
						correctAnswerIndex: 1
					}
				]
			},
			{
				id: 'p6',
				title: 'Teaching Science & Discovery Learning',
				description: 'Teach science concepts from Classes 1–6 clearly and practically, use simple classroom and home-made resources for science experiments, conduct safe child-friendly experiments, and build curiosity, critical thinking, and observation skills.',
				content: {
					html: `<div class="space-y-6">
						<div class="bg-primary/5 border-l-4 border-primary p-4 rounded-r-lg">
							<h3 class="font-bold text-lg mb-3 text-primary">🎯 Learning Objectives</h3>
							<p class="text-sm mb-2">By the end of this module, trainees will be able to:</p>
							<ul class="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-4">
								<li>Teach science concepts from Classes 1–6 clearly and practically</li>
								<li>Use simple classroom and home-made resources for science experiments</li>
								<li>Conduct safe, child-friendly experiments</li>
								<li>Build curiosity, critical thinking, and observation skills</li>
								<li>Integrate health, hygiene, and environmental topics</li>
								<li>Prepare pupils for real-life science understanding</li>
							</ul>
						</div>

						<section class="space-y-4">
							<h2 class="text-2xl font-bold text-primary">6.1 PURPOSE OF PRIMARY SCIENCE</h2>
							<p class="text-muted-foreground">Science teaches children to observe, ask questions, test ideas, and solve problems.</p>
							<div class="bg-primary/5 p-4 rounded-lg my-4">
								<h3 class="font-semibold mb-2">Benefits for primary pupils:</h3>
								<ul class="list-disc list-inside space-y-1 text-sm text-muted-foreground">
									<li>🧐 Develop curiosity</li>
									<li>🔍 Encourage critical thinking</li>
									<li>👀 Improve observation skills</li>
									<li>🚀 Foster problem-solving</li>
									<li>🌍 Promote environmental awareness</li>
									<li>💧🧼 Build healthy hygiene habits</li>
								</ul>
								<p class="text-sm font-medium mt-2">Teaching tip: Use local materials and everyday phenomena to make science relatable.</p>
							</div>
						</section>

						<section class="space-y-4">
							<h2 class="text-2xl font-bold text-primary">6.2 PRINCIPLES OF SCIENCE TEACHING (CBC STYLE)</h2>
							<div class="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
								<div class="bg-green-50 dark:bg-green-950/20 p-4 rounded-lg border-l-4 border-green-500">
									<h3 class="font-semibold mb-2 text-green-700 dark:text-green-400">✅ Do</h3>
									<ul class="list-disc list-inside space-y-1 text-sm text-muted-foreground">
										<li>Start from children's experiences</li>
										<li>Use real objects and visual aids</li>
										<li>Ask questions instead of only giving answers</li>
										<li>Encourage experiments and exploration</li>
										<li>Allow pupils to explain in their own words</li>
										<li>Use the natural environment as a laboratory</li>
									</ul>
								</div>
								<div class="bg-red-50 dark:bg-red-950/20 p-4 rounded-lg border-l-4 border-red-500">
									<h3 class="font-semibold mb-2 text-red-700 dark:text-red-400">❌ Avoid</h3>
									<ul class="list-disc list-inside space-y-1 text-sm text-muted-foreground">
										<li>Memorization without understanding</li>
										<li>Fear-based teaching ("Don't touch! Stop!")</li>
									</ul>
									<p class="text-sm font-medium mt-2">Instead say: "Let us observe safely and carefully."</p>
								</div>
							</div>
						</section>

						<section class="space-y-4">
							<h2 class="text-2xl font-bold text-primary">6.3 CORE SCIENCE TOPICS (CLASSES 1–6)</h2>
							<div class="overflow-x-auto my-4">
								<table class="min-w-full border-collapse border border-primary/20">
									<thead class="bg-primary/10">
										<tr>
											<th class="border border-primary/20 p-2 text-left text-sm font-semibold">Theme</th>
											<th class="border border-primary/20 p-2 text-left text-sm font-semibold">Examples / Activities</th>
										</tr>
									</thead>
									<tbody class="text-sm">
										<tr>
											<td class="border border-primary/20 p-2 font-medium">Living things</td>
											<td class="border border-primary/20 p-2">Plants, animals, humans — classify, observe, lifecycle</td>
										</tr>
										<tr class="bg-muted/30">
											<td class="border border-primary/20 p-2 font-medium">Non-living things</td>
											<td class="border border-primary/20 p-2">Rocks, soil, water, air — properties, sorting</td>
										</tr>
										<tr>
											<td class="border border-primary/20 p-2 font-medium">Human body</td>
											<td class="border border-primary/20 p-2">Senses, hygiene, organs, safety</td>
										</tr>
										<tr class="bg-muted/30">
											<td class="border border-primary/20 p-2 font-medium">Plants</td>
											<td class="border border-primary/20 p-2">Parts, growth, needs, farming</td>
										</tr>
										<tr>
											<td class="border border-primary/20 p-2 font-medium">Environment</td>
											<td class="border border-primary/20 p-2">Soil, water, weather, sanitation, recycling</td>
										</tr>
										<tr class="bg-muted/30">
											<td class="border border-primary/20 p-2 font-medium">Health</td>
											<td class="border border-primary/20 p-2">Balanced diet, disease prevention, exercise, first aid</td>
										</tr>
									</tbody>
								</table>
							</div>
						</section>

						<section class="space-y-4">
							<h2 class="text-2xl font-bold text-primary">6.4 DISCOVERY-BASED SCIENCE STEPS</h2>
							<div class="bg-primary/5 p-4 rounded-lg my-4">
								<ol class="list-decimal list-inside space-y-2 text-sm text-muted-foreground ml-4">
									<li>Ask a question</li>
									<li>Predict an answer (hypothesis)</li>
									<li>Observe / test (experiment)</li>
									<li>Record results</li>
									<li>Discuss & conclude</li>
								</ol>
								<p class="text-sm font-medium mt-2">Example question: "What happens to water when left in the sun?"</p>
								<p class="text-sm text-muted-foreground">Observation: Evaporation occurs.</p>
								<p class="text-sm font-medium mt-2">Teacher note: Always supervise experiments for safety and encourage pupils to share observations.</p>
							</div>
						</section>

						<section class="space-y-4">
							<h2 class="text-2xl font-bold text-primary">6.5 SIMPLE CLASSROOM EXPERIMENTS</h2>
							<div class="overflow-x-auto my-4">
								<table class="min-w-full border-collapse border border-primary/20">
									<thead class="bg-primary/10">
										<tr>
											<th class="border border-primary/20 p-2 text-left text-sm font-semibold">Concept</th>
											<th class="border border-primary/20 p-2 text-left text-sm font-semibold">Experiment</th>
											<th class="border border-primary/20 p-2 text-left text-sm font-semibold">Materials</th>
										</tr>
									</thead>
									<tbody class="text-sm">
										<tr>
											<td class="border border-primary/20 p-2 font-medium">Floating vs. sinking</td>
											<td class="border border-primary/20 p-2">Test objects in water</td>
											<td class="border border-primary/20 p-2">Bowl, stones, plastic, spoon</td>
										</tr>
										<tr class="bg-muted/30">
											<td class="border border-primary/20 p-2 font-medium">Plant growth</td>
											<td class="border border-primary/20 p-2">Grow seeds in cotton</td>
											<td class="border border-primary/20 p-2">Beans, cotton, jars</td>
										</tr>
										<tr>
											<td class="border border-primary/20 p-2 font-medium">Evaporation</td>
											<td class="border border-primary/20 p-2">Put water in sun vs shade</td>
											<td class="border border-primary/20 p-2">2 plates, water</td>
										</tr>
									</tbody>
								</table>
							</div>
							<p class="text-sm text-muted-foreground">Always explain safety rules and let children record observations.</p>
						</section>
					</div>`
				},
				quiz: [
					{
						question: "Best method to teach primary science?",
						options: [
							"Lecturing only",
							"Memorization",
							"Discovery / observation",
							"Reading textbooks silently"
						],
						correctAnswerIndex: 2
					},
					{
						question: "Example of living things?",
						options: [
							"Rock",
							"Dog",
							"Ball",
							"Water"
						],
						correctAnswerIndex: 1
					},
					{
						question: "Why is handwashing important?",
						options: [
							"For fun",
							"Prevent disease",
							"To waste water",
							"To clean books"
						],
						correctAnswerIndex: 1
					},
					{
						question: "Plant needs?",
						options: [
							"Sunlight, water, soil, air",
							"Chocolate, sugar",
							"Only water",
							"Only sunlight"
						],
						correctAnswerIndex: 0
					},
					{
						question: "Example of evaporation?",
						options: [
							"Water drying in sun",
							"Water in cup forever",
							"Rock melting",
							"Leaf falling"
						],
						correctAnswerIndex: 0
					},
					{
						question: "What should pupils do first in discovery learning?",
						options: [
							"Predict outcome",
							"Ask a question",
							"Record results",
							"Discuss conclusion"
						],
						correctAnswerIndex: 1
					},
					{
						question: "Which is a safe classroom experiment?",
						options: [
							"Mix chemicals without supervision",
							"Observe plant growth using jars",
							"Burn paper",
							"Pour water on electrical sockets"
						],
						correctAnswerIndex: 1
					},
					{
						question: "What is a core principle of science teaching?",
						options: [
							"Fear-based discipline",
							"Memorization only",
							"Start from what children see & touch",
							"Read from books only"
						],
						correctAnswerIndex: 2
					},
					{
						question: "Example of a non-living thing?",
						options: [
							"Tree",
							"Dog",
							"Rock",
							"Flower"
						],
						correctAnswerIndex: 2
					},
					{
						question: "Upper Primary science strategy includes:",
						options: [
							"Nature walks only",
							"Group research and simple experiments",
							"Memorization of textbooks",
							"Drawing only"
						],
						correctAnswerIndex: 1
					},
					{
						question: "Which activity promotes observation skills?",
						options: [
							"Reading silently",
							"Sorting objects by size",
							"Memorizing definitions",
							"Listening to teacher only"
						],
						correctAnswerIndex: 1
					},
					{
						question: "Why use local materials in science?",
						options: [
							"Cheaper & relatable",
							"Expensive kits are unnecessary",
							"Makes learning concrete",
							"All of the above"
						],
						correctAnswerIndex: 3
					},
					{
						question: "Which is an example of health science?",
						options: [
							"Shadow experiment",
							"Handwashing",
							"Plant drawing",
							"Counting objects"
						],
						correctAnswerIndex: 1
					},
					{
						question: "Example of a project in environmental education?",
						options: [
							"Planting a class garden",
							"Memorizing a poem",
							"Counting numbers",
							"Reading silently"
						],
						correctAnswerIndex: 0
					},
					{
						question: "How can teachers support struggling science learners?",
						options: [
							"Use complex textbooks",
							"Skip content",
							"Use pictures, repeat vocabulary, guide experiments",
							"Punish mistakes"
						],
						correctAnswerIndex: 2
					}
				]
			},
			{
				id: 'p7',
				title: 'Teaching Social Studies, Civics & National Values',
				description: 'Teach Social Studies from Classes 1–6 effectively, explain family, community, culture, and leadership concepts, teach civics, rights, responsibilities, and patriotism, and promote peace, unity, integrity, hard work, and respect.',
				content: {
					html: `<div class="space-y-6">
						<div class="bg-primary/5 border-l-4 border-primary p-4 rounded-r-lg">
							<h3 class="font-bold text-lg mb-3 text-primary">🎯 Learning Objectives</h3>
							<p class="text-sm mb-2">By the end of this module, trainees will be able to:</p>
							<ul class="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-4">
								<li>Teach Social Studies from Classes 1–6 effectively</li>
								<li>Explain family, community, culture, and leadership concepts</li>
								<li>Teach civics, rights, responsibilities, and patriotism</li>
								<li>Introduce basic African geography and Cameroon studies</li>
								<li>Promote peace, unity, integrity, hard work, and respect</li>
								<li>Teach national symbols, cultural pride, and heritage</li>
								<li>Use stories, role-play, projects, and visual aids in lessons</li>
							</ul>
						</div>

						<section class="space-y-4">
							<h2 class="text-2xl font-bold text-primary">7.1 WHY SOCIAL STUDIES MATTERS</h2>
							<p class="text-muted-foreground">Social Studies develops responsible citizens and future leaders.</p>
							<div class="bg-primary/5 p-4 rounded-lg my-4">
								<h3 class="font-semibold mb-2">Benefits for learners:</h3>
								<ul class="list-disc list-inside space-y-1 text-sm text-muted-foreground">
									<li>Understand their family, community, and environment</li>
									<li>Respect culture, elders, and laws</li>
									<li>Learn rights and responsibilities</li>
									<li>Live peacefully and resolve conflicts</li>
									<li>Understand leadership, teamwork, and governance</li>
									<li>Develop pride in Cameroon and Africa</li>
								</ul>
								<p class="text-sm font-medium mt-2">Teaching tip: Use real-life examples to connect theory to children's experiences.</p>
							</div>
						</section>

						<section class="space-y-4">
							<h2 class="text-2xl font-bold text-primary">7.2 CAMEROON NATIONAL IDENTITY</h2>
							<div class="bg-primary/5 p-4 rounded-lg my-4">
								<h3 class="font-semibold mb-2">National Symbols:</h3>
								<ul class="list-disc list-inside space-y-1 text-sm text-muted-foreground">
									<li>🇨🇲 Flag</li>
									<li>Coat of Arms</li>
									<li>National Anthem</li>
									<li>Seal of the Republic</li>
									<li>Presidency</li>
								</ul>
								<h3 class="font-semibold mt-4 mb-2">National Values:</h3>
								<ul class="list-disc list-inside space-y-1 text-sm text-muted-foreground">
									<li>Unity</li>
									<li>Peace</li>
									<li>Respect</li>
									<li>Love for country</li>
									<li>Hard work</li>
									<li>Honesty</li>
									<li>Discipline</li>
								</ul>
								<p class="text-sm font-medium mt-2">Classroom activity: Children draw, color, and explain national symbols.</p>
							</div>
						</section>

						<section class="space-y-4">
							<h2 class="text-2xl font-bold text-primary">7.3 CAMEROON GEOGRAPHY</h2>
							<div class="overflow-x-auto my-4">
								<table class="min-w-full border-collapse border border-primary/20">
									<thead class="bg-primary/10">
										<tr>
											<th class="border border-primary/20 p-2 text-left text-sm font-semibold">Feature</th>
											<th class="border border-primary/20 p-2 text-left text-sm font-semibold">Example</th>
										</tr>
									</thead>
									<tbody class="text-sm">
										<tr>
											<td class="border border-primary/20 p-2 font-medium">Capital</td>
											<td class="border border-primary/20 p-2">Yaoundé</td>
										</tr>
										<tr class="bg-muted/30">
											<td class="border border-primary/20 p-2 font-medium">Largest city</td>
											<td class="border border-primary/20 p-2">Douala</td>
										</tr>
										<tr>
											<td class="border border-primary/20 p-2 font-medium">Regions</td>
											<td class="border border-primary/20 p-2">10 regions</td>
										</tr>
										<tr class="bg-muted/30">
											<td class="border border-primary/20 p-2 font-medium">Major rivers</td>
											<td class="border border-primary/20 p-2">Sanaga, Wouri, Logone</td>
										</tr>
										<tr>
											<td class="border border-primary/20 p-2 font-medium">Mountains</td>
											<td class="border border-primary/20 p-2">Mount Cameroon</td>
										</tr>
									</tbody>
								</table>
							</div>
							<p class="text-sm text-muted-foreground">Activity: Pupils draw and color a map of Cameroon, labeling major regions and rivers.</p>
						</section>

						<section class="space-y-4">
							<h2 class="text-2xl font-bold text-primary">7.4 HUMAN RIGHTS & RESPONSIBILITIES (CHILD-FRIENDLY)</h2>
							<div class="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
								<div class="bg-primary/5 p-4 rounded-lg">
									<h3 class="font-semibold mb-2">Rights:</h3>
									<ul class="list-disc list-inside space-y-1 text-sm text-muted-foreground">
										<li>Education</li>
										<li>Safety</li>
										<li>Health</li>
										<li>Respect</li>
										<li>Identity</li>
									</ul>
								</div>
								<div class="bg-primary/5 p-4 rounded-lg">
									<h3 class="font-semibold mb-2">Responsibilities:</h3>
									<ul class="list-disc list-inside space-y-1 text-sm text-muted-foreground">
										<li>Obey rules</li>
										<li>Respect elders</li>
										<li>Keep school clean</li>
										<li>Help others</li>
										<li>Tell the truth</li>
									</ul>
								</div>
							</div>
							<p class="text-sm text-muted-foreground">Activity: Match rights with responsibilities using classroom examples.</p>
						</section>
					</div>`
				},
				quiz: [
					{
						question: "Capital of Cameroon?",
						options: [
							"Douala",
							"Bamenda",
							"Yaoundé",
							"Garoua"
						],
						correctAnswerIndex: 2
					},
					{
						question: "Highest mountain in Cameroon?",
						options: [
							"Mount Oku",
							"Mount Cameroon",
							"Mount Bamboutos",
							"Mount Manengouba"
						],
						correctAnswerIndex: 1
					},
					{
						question: "Example of community helpers?",
						options: [
							"Rock, tree",
							"Nurse, police, teacher",
							"Sun, moon",
							"Pencil, notebook"
						],
						correctAnswerIndex: 1
					},
					{
						question: "Main national values?",
						options: [
							"Unity, peace, work",
							"Lying, cheating, stealing",
							"Laziness, disrespect",
							"Ignorance"
						],
						correctAnswerIndex: 0
					},
					{
						question: "A good citizen…",
						options: [
							"Breaks rules",
							"Respects rules, loves country",
							"Ignores neighbors",
							"Avoids work"
						],
						correctAnswerIndex: 1
					},
					{
						question: "Rights of a child include:",
						options: [
							"Education, safety, respect",
							"Laziness, skipping school",
							"Harming others",
							"Disrespecting elders"
						],
						correctAnswerIndex: 0
					},
					{
						question: "Responsibilities of a child include:",
						options: [
							"Obey rules, help others",
							"Ignore rules",
							"Cheat in exams",
							"Destroy school property"
						],
						correctAnswerIndex: 0
					},
					{
						question: "Cameroon has how many regions?",
						options: [
							"8",
							"10",
							"12",
							"14"
						],
						correctAnswerIndex: 1
					},
					{
						question: "Example of cultural tradition?",
						options: [
							"Music, dance, festivals",
							"Watching TV only",
							"Ignoring heritage",
							"Reading math textbooks"
						],
						correctAnswerIndex: 0
					},
					{
						question: "What is the main teaching method for social studies?",
						options: [
							"Storytelling, role-play, projects",
							"Only reading textbooks",
							"Memorization of pages",
							"Punishment-based teaching"
						],
						correctAnswerIndex: 0
					},
					{
						question: "What should pupils learn about leadership?",
						options: [
							"Leaders command only",
							"Leaders serve, are fair & responsible",
							"Leaders ignore people",
							"Leaders cheat"
						],
						correctAnswerIndex: 1
					},
					{
						question: "How can social studies help students?",
						options: [
							"Builds respect, patriotism, responsibility",
							"Promotes laziness",
							"Encourages chaos",
							"Avoids community participation"
						],
						correctAnswerIndex: 0
					},
					{
						question: "Example of a civic duty?",
						options: [
							"Voting, obeying laws",
							"Littering",
							"Cheating",
							"Breaking rules"
						],
						correctAnswerIndex: 0
					},
					{
						question: "Peaceful conflict resolution includes:",
						options: [
							"Fighting",
							"Listening and sharing",
							"Yelling",
							"Ignoring classmates"
						],
						correctAnswerIndex: 1
					},
					{
						question: "What is the main teaching method for social studies?",
						options: [
							"Storytelling, role-play, projects",
							"Only reading textbooks",
							"Memorization of pages",
							"Punishment-based teaching"
						],
						correctAnswerIndex: 0
					}
				]
			},
			{
				id: 'p8',
				title: 'Classroom Management, Discipline & Inclusion',
				description: 'Establish clear classroom rules and daily routines, manage student behavior calmly and professionally, use positive discipline rather than fear or punishment, and create a safe, inclusive, and supportive learning environment.',
				content: {
					html: `<div class="space-y-6">
						<div class="bg-primary/5 border-l-4 border-primary p-4 rounded-r-lg">
							<h3 class="font-bold text-lg mb-3 text-primary">🎯 Learning Objectives</h3>
							<p class="text-sm mb-2">By the end of this module, tutors will be able to:</p>
							<ul class="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-4">
								<li>Establish clear classroom rules and daily routines</li>
								<li>Manage student behavior calmly and professionally</li>
								<li>Use positive discipline rather than fear or punishment</li>
								<li>Create a safe, inclusive, and supportive learning environment</li>
								<li>Handle difficult behaviors without shouting or corporal punishment</li>
								<li>Apply emotional-support strategies for children</li>
								<li>Set up reward systems and motivation charts</li>
								<li>Prevent, recognize, and respond to bullying</li>
							</ul>
						</div>

						<section class="space-y-4">
							<h2 class="text-2xl font-bold text-primary">8.1 Philosophy of Classroom Management</h2>
							<p class="text-muted-foreground">A well-managed classroom is safe, structured, calm, and caring.</p>
							<div class="bg-primary/5 p-4 rounded-lg my-4">
								<p class="font-semibold mb-2">Children learn best when:</p>
								<ul class="list-disc list-inside space-y-1 text-sm text-muted-foreground">
									<li>✅ They feel respected</li>
									<li>✅ Classroom has predictable routines</li>
									<li>✅ Expectations are clear and consistent</li>
									<li>✅ Praise is frequent</li>
									<li>✅ Punishment is rare and fair</li>
								</ul>
								<p class="text-sm font-medium mt-2">Tip: Classroom management is not about control—it's about guiding behavior positively.</p>
							</div>
						</section>

						<section class="space-y-4">
							<h2 class="text-2xl font-bold text-primary">8.2 Essential Classroom Rules</h2>
							<p class="text-muted-foreground">Rules should be: Few in number, Simple and understandable, Positively worded, Displayed visibly</p>
							<div class="bg-green-50 dark:bg-green-950/20 p-4 rounded-lg my-4">
								<h3 class="font-semibold mb-2">Sample "Do" Rules Poster ✅</h3>
								<ul class="list-disc list-inside space-y-1 text-sm text-muted-foreground">
									<li>✅ We listen when others speak</li>
									<li>✅ We raise hands before talking</li>
									<li>✅ We respect everyone</li>
									<li>✅ We take care of classroom materials</li>
									<li>✅ We keep our bodies calm (no fighting)</li>
								</ul>
								<p class="text-sm font-medium mt-2">Tip: Avoid "Don't" rules—they are less effective. Example: Instead of "Don't shout," say "Use a calm voice."</p>
							</div>
						</section>

						<section class="space-y-4">
							<h2 class="text-2xl font-bold text-primary">8.3 Positive Discipline Principles</h2>
							<div class="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
								<div class="bg-red-50 dark:bg-red-950/20 p-4 rounded-lg border-l-4 border-red-500">
									<h3 class="font-semibold mb-2 text-red-700 dark:text-red-400">🚫 Avoid</h3>
									<ul class="list-disc list-inside space-y-1 text-sm text-muted-foreground">
										<li>Shouting or yelling</li>
										<li>Corporal punishment (cane)</li>
										<li>Sarcasm or ridicule</li>
										<li>Comparing pupils publicly</li>
									</ul>
								</div>
								<div class="bg-green-50 dark:bg-green-950/20 p-4 rounded-lg border-l-4 border-green-500">
									<h3 class="font-semibold mb-2 text-green-700 dark:text-green-400">✅ Do</h3>
									<ul class="list-disc list-inside space-y-1 text-sm text-muted-foreground">
										<li>Speak at the child's eye level</li>
										<li>Set clear expectations and classroom rules together</li>
										<li>Keep consistent routines</li>
										<li>Use soft consequences that teach reflection</li>
									</ul>
								</div>
							</div>
							<div class="bg-primary/5 p-4 rounded-lg my-4">
								<p class="font-semibold mb-2">Example Strategy: The "1–2–3 Calm Rule"</p>
								<ol class="list-decimal list-inside space-y-1 text-sm text-muted-foreground ml-4">
									<li>Calm verbal warning</li>
									<li>Short reflection time (2 minutes, head on desk)</li>
									<li>Quiet conversation to reflect on behavior and solution</li>
								</ol>
								<p class="text-sm text-muted-foreground mt-2">Discipline should correct, not humiliate.</p>
							</div>
						</section>

						<section class="space-y-4">
							<h2 class="text-2xl font-bold text-primary">8.4 Reward System (Motivation)</h2>
							<div class="bg-primary/5 p-4 rounded-lg my-4">
								<h3 class="font-semibold mb-2">Reward ideas:</h3>
								<ul class="list-disc list-inside space-y-1 text-sm text-muted-foreground">
									<li>Star charts</li>
									<li>Class helper badge</li>
									<li>Group points</li>
									<li>Praise notes</li>
									<li>Extra reading time</li>
									<li>"Brave student of the day"</li>
								</ul>
								<p class="text-sm font-medium mt-2">Reward effort and improvement, not just top performers. Celebrate small wins, especially for slow learners.</p>
							</div>
						</section>

						<section class="space-y-4">
							<h2 class="text-2xl font-bold text-primary">8.5 Anti-Bullying Rules</h2>
							<div class="bg-primary/5 p-4 rounded-lg my-4">
								<h3 class="font-semibold mb-2">Teach children:</h3>
								<ul class="list-disc list-inside space-y-1 text-sm text-muted-foreground">
									<li>🚫 No name-calling</li>
									<li>🚫 No mocking accents / appearance</li>
									<li>🚫 No physical harm</li>
									<li>✅ Tell teacher if bullied</li>
									<li>✅ Stand up for classmates</li>
								</ul>
								<p class="text-sm font-medium mt-2">Slogan: "In this class, we lift each other up."</p>
							</div>
						</section>
					</div>`
				},
				quiz: [
					{
						question: "Which punishment style should be avoided?",
						options: [
							"Calm talk",
							"Shouting / beating",
							"Reward charts",
							"Gentle reminder"
						],
						correctAnswerIndex: 1
					},
					{
						question: "Purpose of classroom rules?",
						options: [
							"Fill the day",
							"Control children through fear",
							"Ensure a safe & respectful class",
							"For decoration"
						],
						correctAnswerIndex: 2
					},
					{
						question: "Reward examples include:",
						options: [
							"Star chart, praise, class helper",
							"Cane, shouting",
							"Public humiliation",
							"Ignoring students"
						],
						correctAnswerIndex: 0
					},
					{
						question: "Calming technique for emotional child?",
						options: [
							"Shouting",
							"Breathe, soft tone",
							"Ignore them",
							"Punish"
						],
						correctAnswerIndex: 1
					},
					{
						question: "Anti-bullying rule includes:",
						options: [
							"Mock others",
							"Respect everyone",
							"Steal classmates' things",
							"Yell at peers"
						],
						correctAnswerIndex: 1
					},
					{
						question: "Best way to correct misbehavior?",
						options: [
							"Eye contact → gentle reminder → logical consequence",
							"Immediate shouting",
							"Cane",
							"Public shaming"
						],
						correctAnswerIndex: 0
					},
					{
						question: "A safe, inclusive classroom should be:",
						options: [
							"Calm, structured, caring",
							"Loud, chaotic",
							"Punitive",
							"Only teacher-centered"
						],
						correctAnswerIndex: 0
					},
					{
						question: "Rewarding slow learners should focus on:",
						options: [
							"Only top students",
							"Effort and improvement",
							"Punishment",
							"Ignoring progress"
						],
						correctAnswerIndex: 1
					},
					{
						question: "Effective classroom routines include:",
						options: [
							"Morning greeting, hand-raising, homework check",
							"Random activities only",
							"Constant punishment",
							"No structure"
						],
						correctAnswerIndex: 0
					},
					{
						question: "Signs a child is emotionally struggling include:",
						options: [
							"Excited participation",
							"Withdrawn, angry outbursts, low confidence",
							"Helping classmates",
							"Following rules"
						],
						correctAnswerIndex: 1
					},
					{
						question: "Inclusive strategies include:",
						options: [
							"Extra time, pairing, visual aids",
							"Ignoring differences",
							"Punishment for slow learners",
							"Same pace for all"
						],
						correctAnswerIndex: 0
					},
					{
						question: "Traffic light system meaning?",
						options: [
							"Only for traffic",
							"Green = good, Yellow = warning, Red = think time",
							"Reward top students only",
							"Ignore behavior"
						],
						correctAnswerIndex: 1
					},
					{
						question: "Reflection cards help children:",
						options: [
							"Punish peers",
							"Think about actions and consequences",
							"Draw randomly",
							"Forget rules"
						],
						correctAnswerIndex: 1
					},
					{
						question: "Teacher should correct:",
						options: [
							"Child personally",
							"Behavior only",
							"Entire class unfairly",
							"Ignore misbehavior"
						],
						correctAnswerIndex: 1
					},
					{
						question: "Anti-bullying slogan for classroom:",
						options: [
							"Only the strong win",
							"In this class, we lift each other up.",
							"Fight for your toys",
							"Ignore others"
						],
						correctAnswerIndex: 1
					}
				]
			},
			{
				id: 'p9',
				title: 'Assessment, Remedial Support & Academic Records',
				description: 'Use MINEDUB Continuous Assessment (C.A.) system effectively, design tests, quizzes, oral checks, and performance tasks, identify struggling pupils early and intervene, and plan remedial lessons using PLP.',
				content: {
					html: `<div class="space-y-6">
						<div class="bg-primary/5 border-l-4 border-primary p-4 rounded-r-lg">
							<h3 class="font-bold text-lg mb-3 text-primary">🎯 Learning Objectives</h3>
							<p class="text-sm mb-2">By the end of this module, tutors will be able to:</p>
							<ul class="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-4">
								<li>Use MINEDUB Continuous Assessment (C.A.) system effectively</li>
								<li>Design tests, quizzes, oral checks, and performance tasks</li>
								<li>Identify struggling pupils early and intervene</li>
								<li>Plan remedial lessons using PLP (Personalized Learning Plan)</li>
								<li>Record scores accurately and write constructive report card comments</li>
								<li>Give meaningful, positive feedback to parents without shaming</li>
								<li>Balance homework to reinforce learning without overburdening pupils</li>
							</ul>
						</div>

						<section class="space-y-4">
							<h2 class="text-2xl font-bold text-primary">9.1 Purpose of Assessment</h2>
							<p class="text-muted-foreground">Assessment helps teachers to:</p>
							<div class="bg-primary/5 p-4 rounded-lg my-4">
								<ul class="list-disc list-inside space-y-1 text-sm text-muted-foreground">
									<li>Monitor pupil learning progress</li>
									<li>Identify pupils who need extra support</li>
									<li>Guide lesson planning</li>
									<li>Improve teaching methods</li>
								</ul>
								<p class="text-sm font-medium mt-2">Important: Assessment is not for punishment or shaming. ✅ Assessment supports learning and growth.</p>
							</div>
						</section>

						<section class="space-y-4">
							<h2 class="text-2xl font-bold text-primary">9.2 Types of Assessment</h2>
							<div class="overflow-x-auto my-4">
								<table class="min-w-full border-collapse border border-primary/20">
									<thead class="bg-primary/10">
										<tr>
											<th class="border border-primary/20 p-2 text-left text-sm font-semibold">Type</th>
											<th class="border border-primary/20 p-2 text-left text-sm font-semibold">Description</th>
											<th class="border border-primary/20 p-2 text-left text-sm font-semibold">Example</th>
										</tr>
									</thead>
									<tbody class="text-sm">
										<tr>
											<td class="border border-primary/20 p-2 font-medium">Diagnostic</td>
											<td class="border border-primary/20 p-2">Before teaching a topic</td>
											<td class="border border-primary/20 p-2">"What do you already know about plants?"</td>
										</tr>
										<tr class="bg-muted/30">
											<td class="border border-primary/20 p-2 font-medium">Formative</td>
											<td class="border border-primary/20 p-2">During lessons</td>
											<td class="border border-primary/20 p-2">Oral questions, exercise book checks, observation</td>
										</tr>
										<tr>
											<td class="border border-primary/20 p-2 font-medium">Summative</td>
											<td class="border border-primary/20 p-2">End of term or unit</td>
											<td class="border border-primary/20 p-2">Written test, project, performance task</td>
										</tr>
										<tr class="bg-muted/30">
											<td class="border border-primary/20 p-2 font-medium">Continuous Assessment (C.A.)</td>
											<td class="border border-primary/20 p-2">Ongoing</td>
											<td class="border border-primary/20 p-2">Classwork, homework, quizzes, participation</td>
										</tr>
									</tbody>
								</table>
							</div>
							<p class="text-sm text-muted-foreground">CBC emphasizes Formative + Continuous Assessment for better learning outcomes.</p>
						</section>

						<section class="space-y-4">
							<h2 class="text-2xl font-bold text-primary">9.3 Remedial Strategy (PLP)</h2>
							<p class="text-muted-foreground">Steps to support learners:</p>
							<div class="bg-primary/5 p-4 rounded-lg my-4">
								<ol class="list-decimal list-inside space-y-1 text-sm text-muted-foreground ml-4">
									<li>Identify learning gaps</li>
									<li>Re-teach in smaller steps</li>
									<li>Use visual aids and hands-on materials</li>
									<li>Practice daily (10–15 minutes)</li>
									<li>Praise every improvement</li>
								</ol>
								<p class="text-sm font-medium mt-2">Never label a pupil as "slow." Encourage step-by-step progress.</p>
							</div>
						</section>

						<section class="space-y-4">
							<h2 class="text-2xl font-bold text-primary">9.4 Homework Guidelines</h2>
							<div class="bg-primary/5 p-4 rounded-lg my-4">
								<p class="font-semibold mb-2">Homework should be:</p>
								<ul class="list-disc list-inside space-y-1 text-sm text-muted-foreground">
									<li>Short and focused</li>
									<li>Reinforce classwork</li>
									<li>Not stressful or punitive</li>
								</ul>
								<h3 class="font-semibold mt-4 mb-2">Suggested duration:</h3>
								<ul class="list-disc list-inside space-y-1 text-sm text-muted-foreground">
									<li>Lower classes: 10–20 minutes</li>
									<li>Upper classes: 30–45 minutes</li>
								</ul>
								<p class="text-sm font-medium mt-2">Avoid: ❌ 10-page copying tasks, ❌ Punishment homework, ❌ Excessive workloads</p>
							</div>
						</section>
					</div>`
				},
				quiz: [
					{
						question: "Purpose of Continuous Assessment (C.A.)?",
						options: [
							"To punish mistakes",
							"Monitor learning continuously",
							"To shame slow learners",
							"To assign extra work"
						],
						correctAnswerIndex: 1
					},
					{
						question: "Diagnostic test is used:",
						options: [
							"During lesson",
							"At the end of term",
							"Before teaching",
							"Only for top students"
						],
						correctAnswerIndex: 2
					},
					{
						question: "Formative assessment occurs:",
						options: [
							"During lessons",
							"Only in exams",
							"At the end of the year",
							"Never"
						],
						correctAnswerIndex: 0
					},
					{
						question: "Summative assessment occurs:",
						options: [
							"At the start of the lesson",
							"During group work",
							"At the end of unit/term",
							"Daily check"
						],
						correctAnswerIndex: 2
					},
					{
						question: "Best homework style is:",
						options: [
							"Long and copying",
							"Short and focused",
							"Punitive",
							"Ignore practice"
						],
						correctAnswerIndex: 1
					},
					{
						question: "PLP means:",
						options: [
							"Planned Learning Program",
							"Personal Learning Plan",
							"Primary Lesson Plan",
							"Pupil Literacy Practice"
						],
						correctAnswerIndex: 1
					},
					{
						question: "Early identification of struggling pupils helps:",
						options: [
							"Punish them",
							"Provide timely remedial support",
							"Ignore their challenges",
							"Compare with top students"
						],
						correctAnswerIndex: 1
					},
					{
						question: "Which tool can assess reading skills?",
						options: [
							"Maths drill",
							"Flashcard reading check",
							"Drawing only",
							"Map labeling"
						],
						correctAnswerIndex: 1
					},
					{
						question: "Positive report card comment example:",
						options: [
							"Poor reader",
							"Needs more practice with addition — keep trying",
							"Lazy child",
							"Fails constantly"
						],
						correctAnswerIndex: 1
					},
					{
						question: "Effective remedial step includes:",
						options: [
							"Teaching in smaller steps",
							"Ignoring gaps",
							"Punishing for errors",
							"Repeating full lessons only"
						],
						correctAnswerIndex: 0
					},
					{
						question: "What is NOT recommended for homework?",
						options: [
							"Focused 10–20 min tasks",
							"Copying 10 pages",
							"Practicing classwork",
							"Short comprehension exercises"
						],
						correctAnswerIndex: 1
					},
					{
						question: "Continuous Assessment percentage for classwork (typical MINEDUB)?",
						options: [
							"5%",
							"20%",
							"50%",
							"100%"
						],
						correctAnswerIndex: 1
					},
					{
						question: "Assessment should always:",
						options: [
							"Shame pupils",
							"Support learning",
							"Compare students publicly",
							"Only evaluate top performers"
						],
						correctAnswerIndex: 1
					},
					{
						question: "Parent feedback should be:",
						options: [
							"Blaming",
							"Positive and respectful",
							"Shaming",
							"Ignored"
						],
						correctAnswerIndex: 1
					},
					{
						question: "Best method to help weak pupils improve:",
						options: [
							"Ignore them",
							"Daily practice with guidance",
							"Punish for mistakes",
							"Skip lessons"
						],
						correctAnswerIndex: 1
					}
				]
			},
			{
				id: 'p10',
				title: 'Tutor Ethics, Communication & Professionalism',
				description: 'Demonstrate professional behavior at all times, communicate respectfully with pupils, parents, and colleagues, maintain confidentiality & ensure child safety, and avoid bias, favoritism, and discrimination.',
				content: {
					html: `<div class="space-y-6">
						<div class="bg-primary/5 border-l-4 border-primary p-4 rounded-r-lg">
							<h3 class="font-bold text-lg mb-3 text-primary">🎯 Learning Objectives</h3>
							<p class="text-sm mb-2">By the end of this module, tutors will be able to:</p>
							<ul class="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-4">
								<li>Demonstrate professional behavior at all times</li>
								<li>Communicate respectfully with pupils, parents, and colleagues</li>
								<li>Maintain confidentiality & ensure child safety</li>
								<li>Avoid bias, favoritism, and discrimination</li>
								<li>Display professional appearance & punctuality</li>
								<li>Manage conflict peacefully and fairly</li>
								<li>Promote school values and represent the institution with pride</li>
								<li>Maintain appropriate teacher–student boundaries</li>
							</ul>
						</div>

						<section class="space-y-4">
							<h2 class="text-2xl font-bold text-primary">10.1 What is Teacher Professionalism?</h2>
							<p class="text-muted-foreground">A professional teacher:</p>
							<div class="bg-primary/5 p-4 rounded-lg my-4">
								<ul class="list-disc list-inside space-y-1 text-sm text-muted-foreground">
									<li>Behaves ethically and with integrity</li>
									<li>Prepares lessons and records carefully</li>
									<li>Shows respect to all children and adults</li>
									<li>Acts as a role model in speech, behavior, and attitude</li>
									<li>Protects children's dignity, safety, and well-being</li>
									<li>Builds trust with parents, colleagues, and pupils</li>
								</ul>
								<p class="text-sm font-medium mt-2">Key point: A teacher's behavior directly influences children's confidence and learning outcomes.</p>
							</div>
						</section>

						<section class="space-y-4">
							<h2 class="text-2xl font-bold text-primary">10.2 Ethical Conduct Standards</h2>
							<div class="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
								<div class="bg-green-50 dark:bg-green-950/20 p-4 rounded-lg border-l-4 border-green-500">
									<h3 class="font-semibold mb-2 text-green-700 dark:text-green-400">Do: ✅</h3>
									<ul class="list-disc list-inside space-y-1 text-sm text-muted-foreground">
										<li>Be honest and transparent</li>
										<li>Treat all pupils fairly</li>
										<li>Maintain privacy about pupils' personal matters</li>
										<li>Encourage and guide pupils without embarrassment</li>
										<li>Report safety, health, or abuse concerns immediately</li>
										<li>Use approved teaching materials</li>
										<li>Keep personal life separate from school responsibilities</li>
									</ul>
								</div>
								<div class="bg-red-50 dark:bg-red-950/20 p-4 rounded-lg border-l-4 border-red-500">
									<h3 class="font-semibold mb-2 text-red-700 dark:text-red-400">Avoid: ❌</h3>
									<ul class="list-disc list-inside space-y-1 text-sm text-muted-foreground">
										<li>Insulting or humiliating children</li>
										<li>Asking pupils for personal gifts</li>
										<li>Gossiping about pupils, parents, or colleagues</li>
									</ul>
									<p class="text-sm font-medium mt-2">Tip: Ethical conduct protects both teacher and students.</p>
								</div>
							</div>
						</section>

						<section class="space-y-4">
							<h2 class="text-2xl font-bold text-primary">10.3 Communication Skills</h2>
							<div class="bg-primary/5 p-4 rounded-lg my-4">
								<h3 class="font-semibold mb-2">With Pupils:</h3>
								<ul class="list-disc list-inside space-y-1 text-sm text-muted-foreground">
									<li>Use warm but firm tone</li>
									<li>Give simple, clear instructions</li>
									<li>Encourage participation and praise effort</li>
								</ul>
								<p class="text-sm font-medium mt-2">Replace: "You don't understand anything."</p>
								<p class="text-sm font-medium text-green-600 dark:text-green-400">With: "Good try — let's go through it together." ✅</p>
							</div>
							<div class="bg-primary/5 p-4 rounded-lg my-4">
								<h3 class="font-semibold mb-2">With Parents:</h3>
								<p class="text-sm text-muted-foreground">Be respectful and collaborative. Provide solutions, not blame.</p>
								<p class="text-sm font-medium mt-2">Say: "Let's help build Sara's reading skills together."</p>
								<p class="text-sm font-medium text-red-600 dark:text-red-400">Don't say: "Your child is stubborn." ❌</p>
							</div>
						</section>

						<section class="space-y-4">
							<h2 class="text-2xl font-bold text-primary">10.4 Avoiding Bias</h2>
							<div class="bg-primary/5 p-4 rounded-lg my-4">
								<p class="font-semibold mb-2">Do not discriminate based on:</p>
								<ul class="list-disc list-inside space-y-1 text-sm text-muted-foreground">
									<li>Tribe, language, religion, or gender</li>
									<li>Family background or wealth</li>
									<li>Appearance or disabilities</li>
								</ul>
								<p class="text-sm font-medium mt-2">Every child deserves equal attention and support.</p>
							</div>
						</section>
					</div>`
				},
				quiz: [
					{
						question: "Should teachers gossip about pupils?",
						options: [
							"Yes",
							"No",
							"Only with colleagues",
							"Only parents"
						],
						correctAnswerIndex: 1
					},
					{
						question: "Best communication style with pupils?",
						options: [
							"Harsh and direct",
							"Sarcastic",
							"Respectful, calm, solution-focused",
							"Humorous only"
						],
						correctAnswerIndex: 2
					},
					{
						question: "Teacher dress should be:",
						options: [
							"Casual, untidy",
							"Trendy only",
							"Neat and respectable",
							"Unconcerned"
						],
						correctAnswerIndex: 2
					},
					{
						question: "If abuse is suspected, a teacher should:",
						options: [
							"Ignore it",
							"Discuss with friends",
							"Report to school authority",
							"Handle alone"
						],
						correctAnswerIndex: 2
					},
					{
						question: "Showing favoritism in class is:",
						options: [
							"Acceptable",
							"Never",
							"Only for top students",
							"Sometimes fine"
						],
						correctAnswerIndex: 1
					},
					{
						question: "Which is an example of proper teacher–student boundary?",
						options: [
							"Allowing pupils to visit home",
							"Encouraging respectful distance",
							"Sending private messages",
							"Giving gifts to favorites"
						],
						correctAnswerIndex: 1
					},
					{
						question: "Confidentiality includes:",
						options: [
							"Sharing grades with classmates",
							"Discussing family issues outside school",
							"Keeping pupil records private",
							"Posting photos without permission"
						],
						correctAnswerIndex: 2
					},
					{
						question: "Best way to handle a disruptive pupil?",
						options: [
							"Shout and threaten",
							"Calmly redirect and explain",
							"Punish publicly",
							"Ignore completely"
						],
						correctAnswerIndex: 1
					},
					{
						question: "Professional online conduct includes:",
						options: [
							"Adding pupils on social media",
							"Private messaging for fun",
							"Sharing only educational content",
							"Chatting freely"
						],
						correctAnswerIndex: 2
					},
					{
						question: "Key sign of ethical teaching:",
						options: [
							"Prepares lessons in advance",
							"Always lets pupils do anything",
							"Ignores rules",
							"Copies colleagues' work"
						],
						correctAnswerIndex: 0
					},
					{
						question: "Conflict resolution should:",
						options: [
							"Escalate issues",
							"Stay calm and seek solutions",
							"Punish misbehavior",
							"Avoid communication"
						],
						correctAnswerIndex: 1
					},
					{
						question: "Respectful communication with parents:",
						options: [
							"Blame them for failures",
							"Collaborate for solutions",
							"Ignore their concerns",
							"Lecture them"
						],
						correctAnswerIndex: 1
					},
					{
						question: "A professional teacher:",
						options: [
							"Shouts to maintain order",
							"Acts as a role model",
							"Shows favoritism",
							"Ignores child safety"
						],
						correctAnswerIndex: 1
					},
					{
						question: "How to avoid bias in classroom?",
						options: [
							"Treat top students better",
							"Treat all children equally",
							"Favor students who pay more",
							"Focus on one tribe"
						],
						correctAnswerIndex: 1
					},
					{
						question: "Professional appearance includes:",
						options: [
							"Groomed hair and clean shoes",
							"Messy clothing",
							"Dirty nails",
							"Casual sloppy look"
						],
						correctAnswerIndex: 0
					}
				]
			},
			{
				id: 'p11',
				title: 'Parent Engagement & Homework Systems',
				description: 'Build positive and professional relationships with parents, communicate effectively through meetings, WhatsApp, calls, and messages, assign meaningful homework that reinforces learning, and guide parents to support learning at home.',
				content: {
					html: `<div class="space-y-6">
						<div class="bg-primary/5 border-l-4 border-primary p-4 rounded-r-lg">
							<h3 class="font-bold text-lg mb-3 text-primary">🎯 Learning Objectives</h3>
							<p class="text-sm mb-2">By the end of this module, tutors will be able to:</p>
							<ul class="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-4">
								<li>Build positive and professional relationships with parents</li>
								<li>Communicate effectively through meetings, WhatsApp, calls, and messages</li>
								<li>Assign meaningful homework that reinforces learning without overloading pupils</li>
								<li>Guide parents to support learning at home</li>
								<li>Handle complaints politely, calmly, and constructively</li>
								<li>Maintain clear teacher–parent boundaries</li>
								<li>Encourage and monitor a home learning routine</li>
							</ul>
						</div>

						<section class="space-y-4">
							<h2 class="text-2xl font-bold text-primary">11.1 Why Parent Engagement Matters</h2>
							<p class="text-muted-foreground">When parents and teachers work together, pupils succeed faster.</p>
							<div class="bg-primary/5 p-4 rounded-lg my-4">
								<h3 class="font-semibold mb-2">Benefits of parent engagement:</h3>
								<ul class="list-disc list-inside space-y-1 text-sm text-muted-foreground">
									<li>Improved attendance and punctuality</li>
									<li>Better classroom behavior and discipline</li>
									<li>Stronger learning habits at home</li>
									<li>Confident, motivated pupils</li>
								</ul>
								<p class="text-sm font-medium mt-2">Parents are partners in learning — not critics or adversaries.</p>
							</div>
						</section>

						<section class="space-y-4">
							<h2 class="text-2xl font-bold text-primary">11.2 Professional Parent Communication Rules</h2>
							<div class="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
								<div class="bg-green-50 dark:bg-green-950/20 p-4 rounded-lg border-l-4 border-green-500">
									<h3 class="font-semibold mb-2 text-green-700 dark:text-green-400">✅ Do:</h3>
									<ul class="list-disc list-inside space-y-1 text-sm text-muted-foreground">
										<li>Always be respectful and polite</li>
										<li>Offer practical solutions, not criticism</li>
										<li>Share both progress and areas for improvement</li>
										<li>Maintain confidentiality</li>
										<li>Respond only during school-approved hours</li>
									</ul>
								</div>
								<div class="bg-red-50 dark:bg-red-950/20 p-4 rounded-lg border-l-4 border-red-500">
									<h3 class="font-semibold mb-2 text-red-700 dark:text-red-400">❌ Avoid:</h3>
									<ul class="list-disc list-inside space-y-1 text-sm text-muted-foreground">
										<li>Arguing emotionally</li>
										<li>Sending harsh or sarcastic messages</li>
										<li>Publicly shaming children or families</li>
										<li>Gossiping about other parents or pupils</li>
									</ul>
								</div>
							</div>
							<p class="text-sm text-muted-foreground">Tip: Professional communication builds trust and collaboration.</p>
						</section>

						<section class="space-y-4">
							<h2 class="text-2xl font-bold text-primary">11.3 Homework System</h2>
							<div class="bg-primary/5 p-4 rounded-lg my-4">
								<p class="font-semibold mb-2">Homework should be:</p>
								<ul class="list-disc list-inside space-y-1 text-sm text-muted-foreground">
									<li>Short, meaningful, and practice-focused</li>
									<li>Age-appropriate and easy to monitor</li>
									<li>Not punitive or overloading</li>
								</ul>
								<h3 class="font-semibold mt-4 mb-2">Suggested homework time:</h3>
								<ul class="list-disc list-inside space-y-1 text-sm text-muted-foreground">
									<li>Class 1–2: 10–15 mins</li>
									<li>Class 3–4: 20–30 mins</li>
									<li>Class 5–6: 30–45 mins</li>
								</ul>
							</div>
						</section>

						<section class="space-y-4">
							<h2 class="text-2xl font-bold text-primary">11.4 Good vs Bad Homework Examples</h2>
							<div class="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
								<div class="bg-green-50 dark:bg-green-950/20 p-4 rounded-lg">
									<h3 class="font-semibold mb-2 text-green-700 dark:text-green-400">✅ Good Homework:</h3>
									<ul class="list-disc list-inside space-y-1 text-sm text-muted-foreground">
										<li>Read 6 sight words, copy 2 sentences</li>
										<li>4 addition problems + 1 word problem</li>
										<li>Draw and label plant parts</li>
									</ul>
								</div>
								<div class="bg-red-50 dark:bg-red-950/20 p-4 rounded-lg">
									<h3 class="font-semibold mb-2 text-red-700 dark:text-red-400">❌ Bad Homework:</h3>
									<ul class="list-disc list-inside space-y-1 text-sm text-muted-foreground">
										<li>Copy 4 pages of text</li>
										<li>Punishment writing "I will be serious" 200 times</li>
										<li>Advanced exercises not taught in class</li>
										<li>Overloading weekend homework</li>
									</ul>
								</div>
							</div>
							<p class="text-sm text-muted-foreground">Homework should build mastery, not stress.</p>
						</section>
					</div>`
				},
				quiz: [
					{
						question: "Homework should be:",
						options: [
							"Long and difficult",
							"Short and meaningful",
							"Punishment-focused",
							"Copying pages only"
						],
						correctAnswerIndex: 1
					},
					{
						question: "WhatsApp groups are used for:",
						options: [
							"Gossip and entertainment",
							"Learning communication",
							"Personal chatting",
							"Arguments with parents"
						],
						correctAnswerIndex: 1
					},
					{
						question: "How should a teacher handle an angry parent?",
						options: [
							"Shout back",
							"Ignore them",
							"Stay calm & listen",
							"Send harsh messages"
						],
						correctAnswerIndex: 2
					},
					{
						question: "Parent role in learning is:",
						options: [
							"Judge of teachers",
							"Competitor",
							"Supporter of school learning at home",
							"Punisher of children"
						],
						correctAnswerIndex: 2
					},
					{
						question: "Bad homework example is:",
						options: [
							"Copy 4 pages",
							"Read 5 sight words",
							"Solve 3 math problems",
							"Draw and label a plant"
						],
						correctAnswerIndex: 0
					},
					{
						question: "Best way to motivate parents?",
						options: [
							"Criticize them",
							"Collaborate & provide solutions",
							"Ignore concerns",
							"Blame them for low scores"
						],
						correctAnswerIndex: 1
					},
					{
						question: "Suggested homework time for Class 3–4:",
						options: [
							"10–15 mins",
							"20–30 mins",
							"30–45 mins",
							"1 hour"
						],
						correctAnswerIndex: 1
					},
					{
						question: "What to avoid in parent WhatsApp groups?",
						options: [
							"Learning tips",
							"Homework reminders",
							"Gossip and insults",
							"Photos of classwork"
						],
						correctAnswerIndex: 2
					},
					{
						question: "A professional teacher responds to complaints by:",
						options: [
							"Shouting",
							"Blaming parents",
							"Listening and offering solutions",
							"Ignoring"
						],
						correctAnswerIndex: 2
					},
					{
						question: "Parents can support learning by:",
						options: [
							"Comparing their child with others",
							"Reading with child daily",
							"Yelling at them",
							"Doing homework for them"
						],
						correctAnswerIndex: 1
					},
					{
						question: "A good opening message for WhatsApp group should:",
						options: [
							"Include gossip",
							"State learning purpose",
							"Criticize pupils",
							"Ignore rules"
						],
						correctAnswerIndex: 1
					},
					{
						question: "Homework should never be:",
						options: [
							"Short and meaningful",
							"Punishment-based",
							"Practice-focused",
							"Age-appropriate"
						],
						correctAnswerIndex: 1
					},
					{
						question: "When parents compare children, teacher should say:",
						options: [
							"Your child is worse.",
							"Every child develops differently.",
							"Other children are better.",
							"Ignore parent"
						],
						correctAnswerIndex: 1
					},
					{
						question: "Parent meetings should always end with:",
						options: [
							"Threats",
							"Gratitude",
							"Criticism",
							"Gossip"
						],
						correctAnswerIndex: 1
					}
				]
			},
			{
				id: 'p12',
				title: 'Digital Teaching, Coding Basics & Child Online Safety',
				description: 'Introduce basic ICT skills to children (Class 1–6), teach coding foundations: logic, sequencing, loops, use tablets, laptops, and computers safely in class, and promote safe and positive online behavior.',
				content: {
					html: `<div class="space-y-6">
						<div class="bg-primary/5 border-l-4 border-primary p-4 rounded-r-lg">
							<h3 class="font-bold text-lg mb-3 text-primary">🎯 Learning Objectives</h3>
							<p class="text-sm mb-2">By the end of this module, tutors will be able to:</p>
							<ul class="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-4">
								<li>Introduce basic ICT skills to children (Class 1–6)</li>
								<li>Teach coding foundations: logic, sequencing, loops</li>
								<li>Use tablets, laptops, and computers safely in class</li>
								<li>Integrate educational apps into lessons</li>
								<li>Promote safe and positive online behavior</li>
								<li>Identify cyberbullying and protect children</li>
								<li>Support digital learning at home and in school</li>
								<li>Maintain professional digital ethics</li>
							</ul>
						</div>

						<section class="space-y-4">
							<h2 class="text-2xl font-bold text-primary">12.1 Purpose of Digital Education in Primary</h2>
							<p class="text-muted-foreground">Children today learn, communicate, and solve problems using technology.</p>
							<div class="bg-primary/5 p-4 rounded-lg my-4">
								<h3 class="font-semibold mb-2">Benefits for learners:</h3>
								<ul class="list-disc list-inside space-y-1 text-sm text-muted-foreground">
									<li>Develops creativity and problem-solving skills</li>
									<li>Improves critical thinking and logical reasoning</li>
									<li>Prepares pupils for future technology-driven learning</li>
									<li>Encourages responsible online behavior</li>
									<li>Supports independent research and project-based learning</li>
								</ul>
								<p class="text-sm font-medium mt-2">Digital literacy = being able to use technology responsibly and effectively.</p>
							</div>
						</section>

						<section class="space-y-4">
							<h2 class="text-2xl font-bold text-primary">12.2 Coding Basics for Kids</h2>
							<p class="text-muted-foreground">Coding = giving instructions to a computer to perform a task.</p>
							<div class="overflow-x-auto my-4">
								<table class="min-w-full border-collapse border border-primary/20">
									<thead class="bg-primary/10">
										<tr>
											<th class="border border-primary/20 p-2 text-left text-sm font-semibold">Concept</th>
											<th class="border border-primary/20 p-2 text-left text-sm font-semibold">Child-friendly meaning</th>
										</tr>
									</thead>
									<tbody class="text-sm">
										<tr>
											<td class="border border-primary/20 p-2 font-medium">Algorithm</td>
											<td class="border border-primary/20 p-2">Step-by-step instructions</td>
										</tr>
										<tr class="bg-muted/30">
											<td class="border border-primary/20 p-2 font-medium">Sequence</td>
											<td class="border border-primary/20 p-2">Correct order of steps</td>
										</tr>
										<tr>
											<td class="border border-primary/20 p-2 font-medium">Loop</td>
											<td class="border border-primary/20 p-2">Repeat instructions</td>
										</tr>
										<tr class="bg-muted/30">
											<td class="border border-primary/20 p-2 font-medium">Debug</td>
											<td class="border border-primary/20 p-2">Fix mistakes</td>
										</tr>
									</tbody>
								</table>
							</div>
							<div class="bg-primary/5 p-4 rounded-lg my-4">
								<p class="font-semibold mb-2">Example Activity: Human Algorithm Game</p>
								<p class="text-sm text-muted-foreground">Teacher: "Stand → clap → sit → smile"</p>
								<p class="text-sm text-muted-foreground">Students follow the steps. Discuss order and errors.</p>
							</div>
						</section>

						<section class="space-y-4">
							<h2 class="text-2xl font-bold text-primary">12.3 Child Online Safety</h2>
							<div class="bg-primary/5 p-4 rounded-lg my-4">
								<h3 class="font-semibold mb-2">Teach pupils:</h3>
								<p class="text-sm font-medium mb-2">🛑 Never share:</p>
								<ul class="list-disc list-inside space-y-1 text-sm text-muted-foreground">
									<li>Full name</li>
									<li>School name</li>
									<li>Home location</li>
									<li>Phone number</li>
									<li>Photos without permission</li>
								</ul>
								<p class="text-sm font-medium mt-2">🚫 Avoid online strangers, suspicious links, fights, or bad language</p>
								<p class="text-sm font-medium mt-2">✅ Always tell an adult if something scares or confuses you</p>
								<p class="text-sm font-medium mt-2">✅ Be kind and respectful online</p>
							</div>
						</section>

						<section class="space-y-4">
							<h2 class="text-2xl font-bold text-primary">12.4 Cyberbullying Prevention</h2>
							<div class="bg-primary/5 p-4 rounded-lg my-4">
								<p class="text-sm text-muted-foreground">Can happen in class chats, online games, social media</p>
								<p class="text-sm font-medium mt-2">Teach pupils: BLOCK and TELL a teacher/parent</p>
								<p class="text-sm font-medium mt-2">Promote kindness and empathy</p>
							</div>
						</section>
					</div>`
				},
				quiz: [
					{
						question: "What is coding?",
						options: [
							"Writing letters only",
							"Giving instructions to a computer",
							"Typing fast",
							"Drawing pictures"
						],
						correctAnswerIndex: 1
					},
					{
						question: "Which is a coding concept?",
						options: [
							"Loop",
							"Eraser",
							"Book",
							"Classroom"
						],
						correctAnswerIndex: 0
					},
					{
						question: "What is the first rule of online safety for children?",
						options: [
							"Share photos immediately",
							"Ask teacher before using devices",
							"Post comments online",
							"Ignore suspicious links"
						],
						correctAnswerIndex: 1
					},
					{
						question: "Which app is suitable for 5–7-year-olds learning coding?",
						options: [
							"ScratchJr",
							"Scratch",
							"Tynker",
							"Code.org"
						],
						correctAnswerIndex: 0
					},
					{
						question: "What is digital literacy?",
						options: [
							"Using devices responsibly and effectively",
							"Playing games online all day",
							"Copying from websites",
							"Watching videos only"
						],
						correctAnswerIndex: 0
					},
					{
						question: "Which of the following is NOT safe online behavior?",
						options: [
							"Telling a teacher about a suspicious message",
							"Sharing home address online",
							"Being polite in chat",
							"Reporting cyberbullying"
						],
						correctAnswerIndex: 1
					},
					{
						question: "Teacher digital ethics includes:",
						options: [
							"Using private chat with pupils",
							"Posting photos without permission",
							"Using school-approved platforms only",
							"Sharing gossip online"
						],
						correctAnswerIndex: 2
					},
					{
						question: "What is an example of a 'human algorithm'?",
						options: [
							"Reading silently",
							"Following step-by-step instructions",
							"Watching a video",
							"Coloring a picture"
						],
						correctAnswerIndex: 1
					},
					{
						question: "Why are coding loops useful?",
						options: [
							"To repeat instructions",
							"To delete files",
							"To type faster",
							"To draw"
						],
						correctAnswerIndex: 0
					},
					{
						question: "Which of these is a child-friendly coding platform?",
						options: [
							"Scratch",
							"Photoshop",
							"PowerPoint",
							"Excel"
						],
						correctAnswerIndex: 0
					},
					{
						question: "Which is a good digital creativity activity?",
						options: [
							"Making stories using a drawing app",
							"Browsing social media",
							"Typing homework answers only",
							"Watching random videos"
						],
						correctAnswerIndex: 0
					},
					{
						question: "Teacher must avoid:",
						options: [
							"Sharing children's photos without consent",
							"Guiding digital projects",
							"Encouraging safe browsing",
							"Teaching coding logic"
						],
						correctAnswerIndex: 0
					},
					{
						question: "Which is a safe online behavior for children?",
						options: [
							"Block and tell teacher if bullied",
							"Reply to strangers",
							"Share passwords",
							"Download unknown files"
						],
						correctAnswerIndex: 0
					},
					{
						question: "Which of the following is a basic ICT skill for Primary pupils?",
						options: [
							"Opening and closing apps",
							"Hacking websites",
							"Posting personal info online",
							"Playing any game"
						],
						correctAnswerIndex: 0
					},
					{
						question: "A good online attitude is:",
						options: [
							"Polite, respectful, responsible",
							"Aggressive and competitive",
							"Ignoring instructions",
							"Posting anything freely"
						],
						correctAnswerIndex: 0
					}
				]
			}
		]
	},

	{
		id: 'secondary',
		name: 'Secondary',
		description: 'Subject-depth teaching, differentiation, and exam preparation.',
		modules: [
			{
				id: 's1',
				title: 'Introduction to Secondary Education & the Professional Role of a Tutor',
				description: 'Understand the purpose and goals of secondary education, identify tutor responsibilities, demonstrate professional conduct, plan effective lessons, and integrate technology responsibly.',
				content: {
					html: `<div class="space-y-10">
						<div class="space-y-6">
							<h1 class="text-3xl font-bold text-primary mb-2">Module 1: Introduction to Secondary Education & the Professional Role of a Tutor</h1>
							<p class="text-muted-foreground mb-6">(Duration: ~60 minutes)</p>

							<div class="bg-primary/5 border-l-4 border-primary p-4 rounded-r-lg">
								<h3 class="font-bold text-lg mb-3 text-primary">🎯 Learning Objectives</h3>
								<p class="text-sm mb-2">By the end of this module, tutors will be able to:</p>
								<ul class="list-disc list-inside space-y-2 text-sm text-muted-foreground ml-4">
									<li>Understand the purpose and goals of secondary education</li>
									<li>Identify the responsibilities of a secondary tutor</li>
									<li>Demonstrate professional and ethical conduct</li>
									<li>Plan effective lessons and guide adolescent learners</li>
									<li>Integrate basic technology responsibly in teaching</li>
								</ul>
							</div>
						</div>

						<div class="space-y-6">
							<h2 class="text-2xl font-bold text-primary">1.1 Purpose of Secondary Education</h2>
							<p class="text-muted-foreground">Secondary education bridges primary learning and higher studies, developing:</p>
							<ul class="list-disc list-inside space-y-2 text-sm text-muted-foreground ml-4">
								<li><strong>Critical thinking and problem-solving skills</strong></li>
								<li><strong>Creativity and independent learning</strong></li>
								<li><strong>Moral, civic, and digital responsibility</strong></li>
								<li><strong>Readiness for further education or career paths</strong></li>
							</ul>
							<div class="bg-primary/5 p-4 rounded-lg my-4">
								<p class="font-semibold mb-2">Example:</p>
								<p class="text-sm text-muted-foreground">Students learn advanced science, math, or literature while developing research and teamwork skills.</p>
							</div>
						</div>

						<div class="space-y-6">
							<h2 class="text-2xl font-bold text-primary">1.2 Role of the Secondary Tutor</h2>
							<p class="text-muted-foreground">Tutors are more than instructors — they are mentors, facilitators, and evaluators.</p>
							<div class="relative overflow-x-auto shadow-sm rounded-lg my-4">
								<table class="w-full text-sm">
									<thead class="bg-primary/5">
										<tr>
											<th class="px-4 py-3 text-left font-semibold">Role</th>
											<th class="px-4 py-3 text-left font-semibold">Function</th>
											<th class="px-4 py-3 text-left font-semibold">Example</th>
										</tr>
									</thead>
									<tbody>
										<tr class="border-b border-primary/10">
											<td class="px-4 py-3 font-medium">Subject Expert</td>
											<td class="px-4 py-3">Master content</td>
											<td class="px-4 py-3">Connect lessons to real-life scenarios</td>
										</tr>
										<tr class="border-b border-primary/10">
											<td class="px-4 py-3 font-medium">Facilitator</td>
											<td class="px-4 py-3">Encourage active learning</td>
											<td class="px-4 py-3">Group discussions, experiments</td>
										</tr>
										<tr class="border-b border-primary/10">
											<td class="px-4 py-3 font-medium">Mentor</td>
											<td class="px-4 py-3">Support emotional growth</td>
											<td class="px-4 py-3">Advise on study habits, peer issues</td>
										</tr>
										<tr class="border-b border-primary/10">
											<td class="px-4 py-3 font-medium">Evaluator</td>
											<td class="px-4 py-3">Assess learning fairly</td>
											<td class="px-4 py-3">Projects, tests, feedback</td>
										</tr>
										<tr class="border-b border-primary/10">
											<td class="px-4 py-3 font-medium">Role Model</td>
											<td class="px-4 py-3">Demonstrate ethics & discipline</td>
											<td class="px-4 py-3">Punctuality, honesty, respect</td>
										</tr>
									</tbody>
								</table>
							</div>
						</div>

						<div class="space-y-6">
							<h2 class="text-2xl font-bold text-primary">1.3 Professional and Ethical Conduct</h2>
							<p class="text-muted-foreground">Tutors should:</p>
							<ul class="list-disc list-inside space-y-2 text-sm text-muted-foreground ml-4">
								<li>Prepare lessons with clear objectives</li>
								<li>Treat students fairly and inclusively</li>
								<li>Respect confidentiality and boundaries</li>
								<li>Use technology responsibly</li>
							</ul>
							<div class="bg-primary/5 p-4 rounded-lg my-4">
								<p class="font-semibold mb-2">Quick Checklist:</p>
								<ul class="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-4">
									<li>✅ Neat appearance</li>
									<li>✅ Respectful communication</li>
									<li>✅ Prepared lessons</li>
									<li>✅ Fair assessment</li>
									<li>✅ Professional online behavior</li>
								</ul>
							</div>
						</div>

						<div class="space-y-6">
							<h2 class="text-2xl font-bold text-primary">1.4 Lesson Planning Essentials</h2>
							<p class="text-muted-foreground">A strong lesson plan includes:</p>
							<ul class="list-disc list-inside space-y-2 text-sm text-muted-foreground ml-4">
								<li><strong>Objective:</strong> What students should learn</li>
								<li><strong>Method:</strong> How you will teach</li>
								<li><strong>Materials:</strong> What resources you need</li>
								<li><strong>Activities:</strong> How students practice</li>
								<li><strong>Assessment:</strong> How learning is measured</li>
							</ul>
							<div class="bg-secondary/5 p-4 rounded-lg my-4">
								<h4 class="font-semibold mb-3">Example:</h4>
								<div class="relative overflow-x-auto shadow-sm rounded-lg">
									<table class="w-full text-sm">
										<thead class="bg-primary/5">
											<tr>
												<th class="px-4 py-3 text-left font-semibold">Topic</th>
												<th class="px-4 py-3 text-left font-semibold">Objective</th>
												<th class="px-4 py-3 text-left font-semibold">Activities</th>
												<th class="px-4 py-3 text-left font-semibold">Assessment</th>
											</tr>
										</thead>
										<tbody>
											<tr class="border-b border-primary/10">
												<td class="px-4 py-3 font-medium">The Water Cycle</td>
												<td class="px-4 py-3">Describe stages and importance</td>
												<td class="px-4 py-3">Group drawing, short quiz</td>
												<td class="px-4 py-3">Oral explanation + written summary</td>
											</tr>
										</tbody>
									</table>
								</div>
							</div>
						</div>

						<div class="space-y-6">
							<h2 class="text-2xl font-bold text-primary">1.5 Technology in Secondary Teaching</h2>
							<ul class="list-disc list-inside space-y-2 text-sm text-muted-foreground ml-4">
								<li>Integrate tools like PowerPoint, Google Classroom, Kahoot</li>
								<li>Assign tasks and projects digitally</li>
								<li>Model responsible digital behavior for students</li>
							</ul>
							<div class="bg-primary/5 p-4 rounded-lg my-4">
								<p class="font-semibold text-sm mb-2">💡 Tip:</p>
								<p class="text-sm text-muted-foreground">Balance online tools with face-to-face teaching for engagement.</p>
							</div>
						</div>

						<div class="space-y-6">
							<h2 class="text-2xl font-bold text-primary">1.6 Challenges & Solutions</h2>
							<div class="relative overflow-x-auto shadow-sm rounded-lg my-4">
								<table class="w-full text-sm">
									<thead class="bg-primary/5">
										<tr>
											<th class="px-4 py-3 text-left font-semibold">Challenge</th>
											<th class="px-4 py-3 text-left font-semibold">Solution</th>
										</tr>
									</thead>
									<tbody>
										<tr class="border-b border-primary/10">
											<td class="px-4 py-3 font-medium">Low motivation</td>
											<td class="px-4 py-3">Use real-life examples, interactive tasks</td>
										</tr>
										<tr class="border-b border-primary/10">
											<td class="px-4 py-3 font-medium">Discipline issues</td>
											<td class="px-4 py-3">Set clear rules, remain calm</td>
										</tr>
										<tr class="border-b border-primary/10">
											<td class="px-4 py-3 font-medium">Diverse abilities</td>
											<td class="px-4 py-3">Use differentiated instruction</td>
										</tr>
										<tr class="border-b border-primary/10">
											<td class="px-4 py-3 font-medium">Limited resources</td>
											<td class="px-4 py-3">Be creative with materials</td>
										</tr>
									</tbody>
								</table>
							</div>
						</div>

						<div class="space-y-6">
							<h2 class="text-2xl font-bold text-primary">✅ Module 1 Summary</h2>
							<ul class="list-disc list-inside space-y-2 text-sm text-muted-foreground ml-4">
								<li>Secondary education develops critical, creative, and independent learners</li>
								<li>Tutors are mentors, facilitators, evaluators, and role models</li>
								<li>Professional ethics and reflective practice are essential</li>
								<li>Lesson planning and digital integration enhance learning</li>
								<li>Tutors help students succeed academically, socially, and morally</li>
							</ul>
						</div>
					</div>`,
					videos: [
						{ youtubeUrl: '', caption: 'Introduction to Secondary Education' },
						{ youtubeUrl: '', caption: 'Professional Role of Tutors' },
					],
				},
				sections: [
					{
						id: 's1s1',
						title: '1.1 Purpose of Secondary Education',
						html: `<div class="space-y-4">
							<p class="text-muted-foreground">Secondary education bridges primary learning and higher studies, developing critical thinking, creativity, moral responsibility, and readiness for further education or career paths.</p>
						</div>`,
						youtubeUrl: '',
						caption: 'Purpose of Secondary Education',
					},
					{
						id: 's1s2',
						title: '1.2 Role of the Secondary Tutor',
						html: `<div class="space-y-4">
							<p class="text-muted-foreground">Tutors serve as subject experts, facilitators, mentors, evaluators, and role models. They connect lessons to real life, encourage active learning, support emotional growth, assess fairly, and demonstrate ethics and discipline.</p>
						</div>`,
						youtubeUrl: '',
						caption: 'Role of Secondary Tutors',
					},
					{
						id: 's1s3',
						title: '1.3 Professional and Ethical Conduct',
						html: `<div class="space-y-4">
							<p class="text-muted-foreground">Tutors should prepare lessons with clear objectives, treat students fairly and inclusively, respect confidentiality and boundaries, and use technology responsibly. Maintain neat appearance, respectful communication, and professional online behavior.</p>
						</div>`,
						youtubeUrl: '',
						caption: 'Professional Conduct for Tutors',
					},
					{
						id: 's1s4',
						title: '1.4 Lesson Planning Essentials',
						html: `<div class="space-y-4">
							<p class="text-muted-foreground">A strong lesson plan includes clear objectives, teaching methods, required materials, student activities, and assessment strategies. Example: Teaching the water cycle with group drawing, quiz, and oral/written assessment.</p>
						</div>`,
						youtubeUrl: '',
						caption: 'Lesson Planning for Secondary',
					},
					{
						id: 's1s5',
						title: '1.5 Technology in Secondary Teaching',
						html: `<div class="space-y-4">
							<p class="text-muted-foreground">Integrate tools like PowerPoint, Google Classroom, and Kahoot. Assign tasks digitally and model responsible digital behavior. Balance online tools with face-to-face teaching for engagement.</p>
						</div>`,
						youtubeUrl: '',
						caption: 'Technology Integration',
					},
					{
						id: 's1s6',
						title: '1.6 Challenges & Solutions',
						html: `<div class="space-y-4">
							<p class="text-muted-foreground">Common challenges include low motivation (use real-life examples), discipline issues (set clear rules), diverse abilities (differentiated instruction), and limited resources (be creative with materials).</p>
						</div>`,
						youtubeUrl: '',
						caption: 'Addressing Teaching Challenges',
					},
				],
				quiz: [
					{
						question: 'The main goal of secondary education is to:',
						options: ['Teach letters and numbers', 'Prepare students for higher studies and life skills', 'Focus only on exams', 'Replace parents'],
						correctAnswerIndex: 1,
					},
					{
						question: 'Which best describes a secondary tutor?',
						options: ['Strict enforcer', 'Mentor and facilitator', 'Homework checker', 'School supervisor'],
						correctAnswerIndex: 1,
					},
					{
						question: 'Professional conduct includes:',
						options: ['Sharing grades publicly', 'Treating students fairly', 'Favoring top students', 'Ignoring students'],
						correctAnswerIndex: 1,
					},
					{
						question: 'A reflective tutor:',
						options: ['Complains about students', 'Evaluates and improves teaching', 'Avoids feedback', 'Skips planning'],
						correctAnswerIndex: 1,
					},
					{
						question: 'Key step in lesson planning:',
						options: ['Writing tests', 'Identifying objectives', 'Arranging furniture', 'Selecting decorations'],
						correctAnswerIndex: 1,
					},
					{
						question: 'Confidentiality means:',
						options: ['Protecting student information', 'Sharing exam answers', 'Ignoring reports', 'Discussing students publicly'],
						correctAnswerIndex: 0,
					},
					{
						question: 'Tutors contribute to national development by:',
						options: ['Promoting ethics', 'Avoiding innovation', 'Limiting critical thought', 'Discouraging teamwork'],
						correctAnswerIndex: 0,
					},
					{
						question: 'Which is a digital teaching guideline?',
						options: ['Use any website', 'Model safe online behavior', 'Private chat with students', 'Ignore technology'],
						correctAnswerIndex: 1,
					},
					{
						question: 'Active learning involves:',
						options: ['Lecturing continuously', 'Engaging students in activities', 'Testing only', 'Assigning homework only'],
						correctAnswerIndex: 1,
					},
					{
						question: 'A sign of poor lesson planning is:',
						options: ['Clear objectives', 'Disorganized flow', 'Logical sequencing', 'Prepared materials'],
						correctAnswerIndex: 1,
					},
					{
						question: 'Inclusion in class means:',
						options: ['Teaching only strong students', 'Encouraging all to participate', 'Ignoring quiet learners', 'Comparing students harshly'],
						correctAnswerIndex: 1,
					},
					{
						question: 'Tutor\'s role in assessment is to:',
						options: ['Cheat for students', 'Evaluate fairly', 'Skip grading', 'Ignore results'],
						correctAnswerIndex: 1,
					},
					{
						question: 'Professional online conduct includes:',
						options: ['Posting student photos without consent', 'Using approved platforms', 'Gossiping about school', 'Private chats with pupils'],
						correctAnswerIndex: 1,
					},
					{
						question: 'Tutors act as role models by:',
						options: ['Being honest and respectful', 'Being indifferent', 'Showing favoritism', 'Being overly strict'],
						correctAnswerIndex: 0,
					},
					{
						question: 'Technology integration is important because:',
						options: ['It replaces teachers', 'It supports engagement and learning', 'It distracts students', 'It reduces interaction'],
						correctAnswerIndex: 1,
					},
				],
			},
			{
				id: 's2',
				title: 'Understanding Adolescent Learners & Learning Psychology',
				description: 'Understand cognitive, emotional, and social development of adolescents, identify learning styles and motivational factors, apply strategies to support learners, and manage classroom behavior effectively.',
				content: {
					html: `<div class="space-y-10">
						<div class="space-y-6">
							<h1 class="text-3xl font-bold text-primary mb-2">Module 2: Understanding Adolescent Learners & Learning Psychology</h1>
							<p class="text-muted-foreground mb-6">(Duration: ~60 minutes)</p>

							<div class="bg-primary/5 border-l-4 border-primary p-4 rounded-r-lg">
								<h3 class="font-bold text-lg mb-3 text-primary">🎯 Learning Objectives</h3>
								<p class="text-sm mb-2">By the end of this module, tutors will be able to:</p>
								<ul class="list-disc list-inside space-y-2 text-sm text-muted-foreground ml-4">
									<li>Understand the cognitive, emotional, and social development of adolescents (ages 11–18)</li>
									<li>Identify different learning styles and motivational factors</li>
									<li>Apply strategies to support adolescent learners effectively</li>
									<li>Manage classroom behavior based on developmental understanding</li>
									<li>Foster a positive, inclusive learning environment</li>
								</ul>
							</div>
						</div>

						<div class="space-y-6">
							<h2 class="text-2xl font-bold text-primary">2.1 Characteristics of Adolescent Learners</h2>
							<p class="text-muted-foreground">Adolescents are in a transitional stage:</p>
							<ul class="list-disc list-inside space-y-2 text-sm text-muted-foreground ml-4">
								<li><strong>Cognitive development:</strong> Begin abstract thinking, problem-solving, reasoning</li>
								<li><strong>Emotional development:</strong> Mood swings, sensitivity, need for recognition</li>
								<li><strong>Social development:</strong> Peer influence is strong; desire for independence</li>
								<li><strong>Physical development:</strong> Puberty affects energy, attention, and participation</li>
							</ul>
							<div class="bg-primary/5 p-4 rounded-lg my-4">
								<p class="font-semibold mb-2">Example:</p>
								<p class="text-sm text-muted-foreground">A 14-year-old may question rules, seek independence, but still need guidance and clear boundaries.</p>
							</div>
						</div>

						<div class="space-y-6">
							<h2 class="text-2xl font-bold text-primary">2.2 Learning Styles</h2>
							<p class="text-muted-foreground">Students learn in different ways. Tutors should adapt instruction to meet diverse needs:</p>
							<div class="relative overflow-x-auto shadow-sm rounded-lg my-4">
								<table class="w-full text-sm">
									<thead class="bg-primary/5">
										<tr>
											<th class="px-4 py-3 text-left font-semibold">Learning Style</th>
											<th class="px-4 py-3 text-left font-semibold">Description</th>
											<th class="px-4 py-3 text-left font-semibold">Example Activity</th>
										</tr>
									</thead>
									<tbody>
										<tr class="border-b border-primary/10">
											<td class="px-4 py-3 font-medium">Visual</td>
											<td class="px-4 py-3">Learns best through images</td>
											<td class="px-4 py-3">Diagrams, charts, mind maps</td>
										</tr>
										<tr class="border-b border-primary/10">
											<td class="px-4 py-3 font-medium">Auditory</td>
											<td class="px-4 py-3">Learns best through listening</td>
											<td class="px-4 py-3">Discussions, oral explanations</td>
										</tr>
										<tr class="border-b border-primary/10">
											<td class="px-4 py-3 font-medium">Kinesthetic</td>
											<td class="px-4 py-3">Learns through movement</td>
											<td class="px-4 py-3">Experiments, role-plays</td>
										</tr>
										<tr class="border-b border-primary/10">
											<td class="px-4 py-3 font-medium">Reading/Writing</td>
											<td class="px-4 py-3">Learns through text</td>
											<td class="px-4 py-3">Summaries, essays, note-taking</td>
										</tr>
									</tbody>
								</table>
							</div>
							<div class="bg-primary/5 p-4 rounded-lg my-4">
								<p class="font-semibold text-sm mb-2">💡 Tip:</p>
								<p class="text-sm text-muted-foreground">Use mixed activities to reach all learners.</p>
							</div>
						</div>

						<div class="space-y-6">
							<h2 class="text-2xl font-bold text-primary">2.3 Motivation & Engagement</h2>
							<p class="text-muted-foreground font-semibold mb-3">Key factors:</p>
							<ul class="list-disc list-inside space-y-2 text-sm text-muted-foreground ml-4">
								<li>Relevance of lessons to real-life goals</li>
								<li>Recognition and praise for effort</li>
								<li>Choice in learning activities</li>
								<li>Interactive, hands-on experiences</li>
							</ul>
							<div class="bg-primary/5 p-4 rounded-lg my-4">
								<p class="font-semibold mb-2">Example:</p>
								<p class="text-sm text-muted-foreground">Use a project-based task on renewable energy to show real-world application of science concepts.</p>
							</div>
						</div>

						<div class="space-y-6">
							<h2 class="text-2xl font-bold text-primary">2.4 Adolescent Behavior Management</h2>
							<div class="relative overflow-x-auto shadow-sm rounded-lg my-4">
								<table class="w-full text-sm">
									<thead class="bg-primary/5">
										<tr>
											<th class="px-4 py-3 text-left font-semibold">Common Behavior</th>
											<th class="px-4 py-3 text-left font-semibold">Strategy</th>
										</tr>
									</thead>
									<tbody>
										<tr class="border-b border-primary/10">
											<td class="px-4 py-3 font-medium">Distraction or daydreaming</td>
											<td class="px-4 py-3">Use interactive questions, short tasks</td>
										</tr>
										<tr class="border-b border-primary/10">
											<td class="px-4 py-3 font-medium">Peer conflicts</td>
											<td class="px-4 py-3">Mediate calmly, teach conflict resolution</td>
										</tr>
										<tr class="border-b border-primary/10">
											<td class="px-4 py-3 font-medium">Resistance to authority</td>
											<td class="px-4 py-3">Explain rationale, give choices where possible</td>
										</tr>
										<tr class="border-b border-primary/10">
											<td class="px-4 py-3 font-medium">Overconfidence</td>
											<td class="px-4 py-3">Set achievable challenges, encourage reflection</td>
										</tr>
									</tbody>
								</table>
							</div>
							<div class="bg-primary/5 p-4 rounded-lg my-4">
								<p class="font-semibold text-sm mb-2">💡 Principle:</p>
								<p class="text-sm text-muted-foreground">Positive reinforcement is more effective than punishment.</p>
							</div>
						</div>

						<div class="space-y-6">
							<h2 class="text-2xl font-bold text-primary">2.5 Supporting Emotional Well-being</h2>
							<ul class="list-disc list-inside space-y-2 text-sm text-muted-foreground ml-4">
								<li>Be approachable and listen actively</li>
								<li>Encourage goal setting and self-reflection</li>
								<li>Promote resilience and problem-solving skills</li>
								<li>Recognize early signs of stress, anxiety, or bullying</li>
							</ul>
							<div class="bg-primary/5 p-4 rounded-lg my-4">
								<p class="font-semibold text-sm mb-2">💡 Tip:</p>
								<p class="text-sm text-muted-foreground">Incorporate short check-ins, journals, or class discussions to monitor well-being.</p>
							</div>
						</div>

						<div class="space-y-6">
							<h2 class="text-2xl font-bold text-primary">2.6 Inclusive Teaching Practices</h2>
							<ul class="list-disc list-inside space-y-2 text-sm text-muted-foreground ml-4">
								<li>Address different learning speeds and abilities</li>
								<li>Encourage peer mentoring and group work</li>
								<li>Provide accessible materials for all learners</li>
								<li>Foster respect for diversity and opinions</li>
							</ul>
							<div class="bg-primary/5 p-4 rounded-lg my-4">
								<p class="font-semibold text-sm mb-2">💡 Principle:</p>
								<p class="text-sm text-muted-foreground">Every learner should feel valued, capable, and supported.</p>
							</div>
						</div>

						<div class="space-y-6">
							<h2 class="text-2xl font-bold text-primary">2.7 Technology & Adolescent Learning</h2>
							<ul class="list-disc list-inside space-y-2 text-sm text-muted-foreground ml-4">
								<li>Use digital tools to engage tech-savvy teens</li>
								<li>Gamified quizzes, simulations, and multimedia content enhance learning</li>
								<li>Monitor online interactions to promote safe and respectful behavior</li>
							</ul>
							<div class="bg-primary/5 p-4 rounded-lg my-4">
								<p class="font-semibold mb-2">Example:</p>
								<p class="text-sm text-muted-foreground">Kahoot quizzes for review sessions can increase participation and motivation.</p>
							</div>
						</div>

						<div class="space-y-6">
							<h2 class="text-2xl font-bold text-primary">✅ Module 2 Summary</h2>
							<ul class="list-disc list-inside space-y-2 text-sm text-muted-foreground ml-4">
								<li>Adolescents have unique cognitive, emotional, and social needs</li>
								<li>Tutors must recognize learning styles and adapt instruction</li>
								<li>Motivation, engagement, and positive behavior management are crucial</li>
								<li>Inclusive, supportive, and tech-aware teaching enhances learning outcomes</li>
								<li>Tutors help adolescents grow academically, emotionally, and socially</li>
							</ul>
						</div>
					</div>`,
					videos: [
						{ youtubeUrl: '', caption: 'Understanding Adolescent Development' },
						{ youtubeUrl: '', caption: 'Learning Styles and Motivation' },
					],
				},
				sections: [
					{
						id: 's2s1',
						title: '2.1 Characteristics of Adolescent Learners',
						html: `<div class="space-y-4">
							<p class="text-muted-foreground">Adolescents (ages 11–18) are in a transitional stage with cognitive development (abstract thinking), emotional development (mood swings, need for recognition), social development (strong peer influence, desire for independence), and physical development (puberty affects energy and attention).</p>
						</div>`,
						youtubeUrl: '',
						caption: 'Adolescent Characteristics',
					},
					{
						id: 's2s2',
						title: '2.2 Learning Styles',
						html: `<div class="space-y-4">
							<p class="text-muted-foreground">Students learn differently: Visual (diagrams, charts), Auditory (discussions, oral explanations), Kinesthetic (experiments, role-plays), Reading/Writing (summaries, essays). Use mixed activities to reach all learners.</p>
						</div>`,
						youtubeUrl: '',
						caption: 'Learning Styles',
					},
					{
						id: 's2s3',
						title: '2.3 Motivation & Engagement',
						html: `<div class="space-y-4">
							<p class="text-muted-foreground">Key factors include relevance to real-life goals, recognition and praise, choice in activities, and interactive experiences. Use project-based tasks to show real-world application.</p>
						</div>`,
						youtubeUrl: '',
						caption: 'Student Motivation',
					},
					{
						id: 's2s4',
						title: '2.4 Adolescent Behavior Management',
						html: `<div class="space-y-4">
							<p class="text-muted-foreground">Common behaviors include distraction (use interactive questions), peer conflicts (mediate calmly), resistance to authority (explain rationale, give choices), and overconfidence (set achievable challenges). Positive reinforcement is more effective than punishment.</p>
						</div>`,
						youtubeUrl: '',
						caption: 'Behavior Management',
					},
					{
						id: 's2s5',
						title: '2.5 Supporting Emotional Well-being',
						html: `<div class="space-y-4">
							<p class="text-muted-foreground">Be approachable, listen actively, encourage goal setting and self-reflection, promote resilience, and recognize early signs of stress, anxiety, or bullying. Use check-ins, journals, or class discussions.</p>
						</div>`,
						youtubeUrl: '',
						caption: 'Student Wellbeing',
					},
					{
						id: 's2s6',
						title: '2.6 Inclusive Teaching Practices',
						html: `<div class="space-y-4">
							<p class="text-muted-foreground">Address different learning speeds, encourage peer mentoring, provide accessible materials, and foster respect for diversity. Every learner should feel valued, capable, and supported.</p>
						</div>`,
						youtubeUrl: '',
						caption: 'Inclusive Teaching',
					},
					{
						id: 's2s7',
						title: '2.7 Technology & Adolescent Learning',
						html: `<div class="space-y-4">
							<p class="text-muted-foreground">Use digital tools to engage tech-savvy teens. Gamified quizzes, simulations, and multimedia enhance learning. Monitor online interactions for safety and respect.</p>
						</div>`,
						youtubeUrl: '',
						caption: 'Technology in Learning',
					},
				],
				quiz: [
					{
						question: 'Adolescents are typically in which age range?',
						options: ['6–10', '11–18', '19–24', '5–10'],
						correctAnswerIndex: 1,
					},
					{
						question: 'Abstract thinking develops during:',
						options: ['Early childhood', 'Adolescence', 'Toddler stage', 'Infancy'],
						correctAnswerIndex: 1,
					},
					{
						question: 'A visual learner prefers:',
						options: ['Diagrams and charts', 'Oral explanations only', 'Hands-on activities only', 'Listening to lectures only'],
						correctAnswerIndex: 0,
					},
					{
						question: 'Kinesthetic learners learn best by:',
						options: ['Reading books', 'Role-playing and experiments', 'Listening to lectures', 'Writing essays only'],
						correctAnswerIndex: 1,
					},
					{
						question: 'Motivation in adolescents increases when:',
						options: ['Lessons are relevant', 'Lessons are repetitive', 'Students are ignored', 'Rules are harsh'],
						correctAnswerIndex: 0,
					},
					{
						question: 'Positive reinforcement is:',
						options: ['Praising good behavior', 'Ignoring effort', 'Punishing mistakes', 'Yelling at students'],
						correctAnswerIndex: 0,
					},
					{
						question: 'A student resists authority. The best strategy is:',
						options: ['Punish immediately', 'Explain rationale and give choices', 'Ignore the student', 'Embarrass publicly'],
						correctAnswerIndex: 1,
					},
					{
						question: 'Inclusive teaching means:',
						options: ['Teaching only fast learners', 'Addressing different abilities', 'Focusing on top students', 'Ignoring quiet students'],
						correctAnswerIndex: 1,
					},
					{
						question: 'Technology in adolescent learning should be:',
						options: ['Monitored and purposeful', 'Unrestricted', 'Used only for fun', 'Avoided completely'],
						correctAnswerIndex: 0,
					},
					{
						question: 'Peer influence is strong because adolescents:',
						options: ['Are independent', 'Seek social acceptance', 'Avoid friends', 'Ignore peers'],
						correctAnswerIndex: 1,
					},
					{
						question: 'Emotional support involves:',
						options: ['Listening actively', 'Criticizing freely', 'Ignoring feelings', 'Punishing mistakes'],
						correctAnswerIndex: 0,
					},
					{
						question: 'Which activity helps auditory learners?',
						options: ['Oral discussion', 'Diagrams', 'Experiments', 'Written summary only'],
						correctAnswerIndex: 0,
					},
					{
						question: 'How can tutors engage resistant students?',
						options: ['Threats', 'Interactive lessons and choices', 'Punishments', 'Ignoring them'],
						correctAnswerIndex: 1,
					},
					{
						question: 'What is a key sign of adolescence?',
						options: ['Emotional sensitivity', 'Full independence', 'Lack of social interest', 'No cognitive change'],
						correctAnswerIndex: 0,
					},
					{
						question: 'Supporting well-being includes:',
						options: ['Ignoring stress', 'Promoting resilience and problem-solving', 'Restricting discussions', 'Avoiding personal check-ins'],
						correctAnswerIndex: 1,
					},
				],
			},
			{
				id: 's3',
				title: 'Curriculum Planning, Lesson Design & Assessment Strategies',
				description: 'Understand the secondary curriculum structure, design effective lesson plans, use varied teaching methods, apply formative and summative assessment, and reflect on teaching effectiveness.',
				content: {
					html: `<div class="space-y-10">
						<div class="space-y-6">
							<h1 class="text-3xl font-bold text-primary mb-2">Module 3: Curriculum Planning, Lesson Design & Assessment Strategies</h1>
							<p class="text-muted-foreground mb-6">(Duration: ~60 minutes)</p>

							<div class="bg-primary/5 border-l-4 border-primary p-4 rounded-r-lg">
								<h3 class="font-bold text-lg mb-3 text-primary">🎯 Learning Objectives</h3>
								<p class="text-sm mb-2">By the end of this module, tutors will be able to:</p>
								<ul class="list-disc list-inside space-y-2 text-sm text-muted-foreground ml-4">
									<li>Understand the structure and objectives of the secondary school curriculum</li>
									<li>Design effective lesson plans aligned with curriculum goals</li>
									<li>Use a variety of teaching methods and activities</li>
									<li>Apply formative and summative assessment strategies</li>
									<li>Reflect on teaching effectiveness for continuous improvement</li>
								</ul>
							</div>
						</div>

						<div class="space-y-6">
							<h2 class="text-2xl font-bold text-primary">3.1 Understanding the Curriculum</h2>
							<p class="text-muted-foreground">Secondary curriculum provides a roadmap for student learning.</p>
							<ul class="list-disc list-inside space-y-2 text-sm text-muted-foreground ml-4">
								<li>Covers core subjects: Math, Science, English, ICT, Social Studies, Arts</li>
								<li>Includes cross-cutting skills: critical thinking, creativity, digital literacy</li>
								<li>Guides learning outcomes and assessment criteria</li>
							</ul>
							<div class="bg-primary/5 p-4 rounded-lg my-4">
								<p class="font-semibold mb-2">Example:</p>
								<p class="text-sm text-muted-foreground">Curriculum specifies learning objectives for Grade 9 Physics, like understanding energy forms and conducting simple experiments.</p>
							</div>
						</div>

						<div class="space-y-6">
							<h2 class="text-2xl font-bold text-primary">3.2 Lesson Planning Essentials</h2>
							<p class="text-muted-foreground">Effective lesson planning ensures lessons are purposeful and engaging:</p>
							<div class="bg-secondary/5 p-4 rounded-lg my-4">
								<h4 class="font-semibold mb-3">Key Elements:</h4>
								<ul class="list-disc list-inside space-y-2 text-sm text-muted-foreground ml-4">
									<li><strong>Learning objectives:</strong> Clear, measurable outcomes</li>
									<li><strong>Teaching methods:</strong> Lecture, discussion, group work, project-based learning</li>
									<li><strong>Resources:</strong> Textbooks, charts, technology, lab equipment</li>
									<li><strong>Activities:</strong> Hands-on exercises, case studies, role-plays</li>
									<li><strong>Assessment:</strong> Quizzes, classwork, projects, observation</li>
								</ul>
							</div>
							<div class="bg-primary/5 p-4 rounded-lg my-4">
								<h4 class="font-semibold mb-3">Sample Lesson Plan:</h4>
								<div class="relative overflow-x-auto shadow-sm rounded-lg">
									<table class="w-full text-sm">
										<thead class="bg-primary/5">
											<tr>
												<th class="px-4 py-3 text-left font-semibold">Section</th>
												<th class="px-4 py-3 text-left font-semibold">Details</th>
											</tr>
										</thead>
										<tbody>
											<tr class="border-b border-primary/10">
												<td class="px-4 py-3 font-medium">Topic</td>
												<td class="px-4 py-3">Photosynthesis</td>
											</tr>
											<tr class="border-b border-primary/10">
												<td class="px-4 py-3 font-medium">Objective</td>
												<td class="px-4 py-3">Students explain stages and importance</td>
											</tr>
											<tr class="border-b border-primary/10">
												<td class="px-4 py-3 font-medium">Activities</td>
												<td class="px-4 py-3">Group diagram, lab observation</td>
											</tr>
											<tr class="border-b border-primary/10">
												<td class="px-4 py-3 font-medium">Assessment</td>
												<td class="px-4 py-3">Oral questions + short written quiz</td>
											</tr>
										</tbody>
									</table>
								</div>
							</div>
						</div>

						<div class="space-y-6">
							<h2 class="text-2xl font-bold text-primary">3.3 Teaching Methods & Strategies</h2>
							<ul class="list-disc list-inside space-y-2 text-sm text-muted-foreground ml-4">
								<li><strong>Direct instruction:</strong> Explains new concepts clearly</li>
								<li><strong>Collaborative learning:</strong> Students work in pairs/groups</li>
								<li><strong>Problem-solving:</strong> Apply knowledge to real-world scenarios</li>
								<li><strong>Flipped classroom:</strong> Students review materials before class</li>
								<li><strong>Differentiated instruction:</strong> Adjust for different learning needs</li>
							</ul>
							<div class="bg-primary/5 p-4 rounded-lg my-4">
								<p class="font-semibold text-sm mb-2">💡 Tip:</p>
								<p class="text-sm text-muted-foreground">Mix methods to maintain engagement and cater to diverse learners.</p>
							</div>
						</div>

						<div class="space-y-6">
							<h2 class="text-2xl font-bold text-primary">3.4 Assessment in Secondary Education</h2>
							<p class="text-muted-foreground font-semibold mb-3">Types of Assessment:</p>
							<div class="relative overflow-x-auto shadow-sm rounded-lg my-4">
								<table class="w-full text-sm">
									<thead class="bg-primary/5">
										<tr>
											<th class="px-4 py-3 text-left font-semibold">Type</th>
											<th class="px-4 py-3 text-left font-semibold">Purpose</th>
											<th class="px-4 py-3 text-left font-semibold">Example</th>
										</tr>
									</thead>
									<tbody>
										<tr class="border-b border-primary/10">
											<td class="px-4 py-3 font-medium">Formative</td>
											<td class="px-4 py-3">Ongoing, monitors progress</td>
											<td class="px-4 py-3">Quizzes, class discussions</td>
										</tr>
										<tr class="border-b border-primary/10">
											<td class="px-4 py-3 font-medium">Summative</td>
											<td class="px-4 py-3">Evaluates learning at end of unit/term</td>
											<td class="px-4 py-3">Tests, projects</td>
										</tr>
										<tr class="border-b border-primary/10">
											<td class="px-4 py-3 font-medium">Diagnostic</td>
											<td class="px-4 py-3">Identifies learning gaps before teaching</td>
											<td class="px-4 py-3">Pre-tests, baseline assessments</td>
										</tr>
										<tr class="border-b border-primary/10">
											<td class="px-4 py-3 font-medium">Peer/Self</td>
											<td class="px-4 py-3">Encourages reflection and critical thinking</td>
											<td class="px-4 py-3">Peer review, self-evaluation checklists</td>
										</tr>
									</tbody>
								</table>
							</div>
							<div class="bg-primary/5 p-4 rounded-lg my-4">
								<p class="font-semibold mb-2">Example:</p>
								<p class="text-sm text-muted-foreground">A weekly mini-test identifies areas where students need extra support.</p>
							</div>
						</div>

						<div class="space-y-6">
							<h2 class="text-2xl font-bold text-primary">3.5 Feedback & Reflection</h2>
							<ul class="list-disc list-inside space-y-2 text-sm text-muted-foreground ml-4">
								<li>Provide specific, constructive feedback</li>
								<li>Highlight strengths and areas for improvement</li>
								<li>Encourage student self-reflection</li>
							</ul>
							<div class="bg-primary/5 p-4 rounded-lg my-4">
								<p class="font-semibold mb-2">Example:</p>
								<p class="text-sm text-muted-foreground">"Your essay clearly explains the causes of World War I, but include more supporting evidence for your arguments."</p>
							</div>
						</div>

						<div class="space-y-6">
							<h2 class="text-2xl font-bold text-primary">3.6 Technology in Lesson Planning & Assessment</h2>
							<ul class="list-disc list-inside space-y-2 text-sm text-muted-foreground ml-4">
								<li>Use digital tools like Google Classroom, Kahoot, or Quizizz</li>
								<li>Share assignments and provide instant feedback</li>
								<li>Track student progress electronically</li>
							</ul>
							<div class="bg-primary/5 p-4 rounded-lg my-4">
								<p class="font-semibold text-sm mb-2">💡 Tip:</p>
								<p class="text-sm text-muted-foreground">Combine traditional and digital methods for effective learning.</p>
							</div>
						</div>

						<div class="space-y-6">
							<h2 class="text-2xl font-bold text-primary">✅ Module 3 Summary</h2>
							<ul class="list-disc list-inside space-y-2 text-sm text-muted-foreground ml-4">
								<li>Secondary curriculum guides learning outcomes and skills development</li>
								<li>Lesson planning ensures structured, engaging, and purposeful teaching</li>
								<li>Diverse teaching methods cater to different learner needs</li>
								<li>Assessment types help monitor progress and inform teaching</li>
								<li>Feedback and reflection support continuous improvement</li>
							</ul>
						</div>
					</div>`,
					videos: [
						{ youtubeUrl: '', caption: 'Curriculum Planning' },
						{ youtubeUrl: '', caption: 'Assessment Strategies' },
					],
				},
				sections: [
					{
						id: 's3s1',
						title: '3.1 Understanding the Curriculum',
						html: `<div class="space-y-4">
							<p class="text-muted-foreground">Secondary curriculum provides a roadmap covering core subjects (Math, Science, English, ICT, Social Studies, Arts) and cross-cutting skills (critical thinking, creativity, digital literacy). It guides learning outcomes and assessment criteria.</p>
						</div>`,
						youtubeUrl: '',
						caption: 'Understanding Curriculum',
					},
					{
						id: 's3s2',
						title: '3.2 Lesson Planning Essentials',
						html: `<div class="space-y-4">
							<p class="text-muted-foreground">Effective lesson plans include clear learning objectives, teaching methods, resources, activities, and assessment. Example: Teaching photosynthesis with group diagrams, lab observation, and oral/written assessment.</p>
						</div>`,
						youtubeUrl: '',
						caption: 'Lesson Planning',
					},
					{
						id: 's3s3',
						title: '3.3 Teaching Methods & Strategies',
						html: `<div class="space-y-4">
							<p class="text-muted-foreground">Methods include direct instruction, collaborative learning, problem-solving, flipped classroom, and differentiated instruction. Mix methods to maintain engagement and cater to diverse learners.</p>
						</div>`,
						youtubeUrl: '',
						caption: 'Teaching Methods',
					},
					{
						id: 's3s4',
						title: '3.4 Assessment in Secondary Education',
						html: `<div class="space-y-4">
							<p class="text-muted-foreground">Types include formative (ongoing monitoring), summative (end of unit/term), diagnostic (identify gaps), and peer/self-assessment (encourage reflection). Use weekly mini-tests to identify areas needing support.</p>
						</div>`,
						youtubeUrl: '',
						caption: 'Assessment Types',
					},
					{
						id: 's3s5',
						title: '3.5 Feedback & Reflection',
						html: `<div class="space-y-4">
							<p class="text-muted-foreground">Provide specific, constructive feedback highlighting strengths and areas for improvement. Encourage student self-reflection. Example: "Your essay clearly explains causes, but include more supporting evidence."</p>
						</div>`,
						youtubeUrl: '',
						caption: 'Feedback Strategies',
					},
					{
						id: 's3s6',
						title: '3.6 Technology in Lesson Planning & Assessment',
						html: `<div class="space-y-4">
							<p class="text-muted-foreground">Use digital tools like Google Classroom, Kahoot, or Quizizz to share assignments, provide instant feedback, and track progress electronically. Combine traditional and digital methods.</p>
						</div>`,
						youtubeUrl: '',
						caption: 'Technology Integration',
					},
				],
				quiz: [
					{
						question: 'What is the main purpose of a curriculum?',
						options: ['To provide a roadmap for student learning', 'To create extra homework', 'To limit teacher creativity', 'To entertain students'],
						correctAnswerIndex: 0,
					},
					{
						question: 'Learning objectives should be:',
						options: ['Vague', 'Clear and measurable', 'Optional', 'Only for exams'],
						correctAnswerIndex: 1,
					},
					{
						question: 'Which teaching method encourages student collaboration?',
						options: ['Lecture only', 'Group work', 'Silent reading alone', 'Punishment'],
						correctAnswerIndex: 1,
					},
					{
						question: 'Formative assessment is:',
						options: ['Ongoing to monitor learning', 'At the end of the year only', 'Optional', 'Only for advanced students'],
						correctAnswerIndex: 0,
					},
					{
						question: 'Summative assessment occurs:',
						options: ['During teaching', 'At the end of a unit or term', 'Randomly', 'Daily'],
						correctAnswerIndex: 1,
					},
					{
						question: 'Flipped classroom means:',
						options: ['Students teach the class', 'Students review materials before class', 'Teacher skips teaching', 'Students sleep during class'],
						correctAnswerIndex: 1,
					},
					{
						question: 'Differentiated instruction is:',
						options: ['Same for all students', 'Adjusted for different learning needs', 'Only for weak students', 'Only for strong students'],
						correctAnswerIndex: 1,
					},
					{
						question: 'Feedback should be:',
						options: ['Specific and constructive', 'Vague', 'Negative only', 'Optional'],
						correctAnswerIndex: 0,
					},
					{
						question: 'Peer assessment encourages:',
						options: ['Gossip', 'Reflection and critical thinking', 'Cheating', 'Competition only'],
						correctAnswerIndex: 1,
					},
					{
						question: 'Diagnostic assessment helps to:',
						options: ['Identify learning gaps before teaching', 'Punish students', 'Replace exams', 'Ignore weak students'],
						correctAnswerIndex: 0,
					},
					{
						question: 'Which is a key element of lesson planning?',
						options: ['Learning objectives', 'Random activities', 'Ignoring materials', 'Skipping assessment'],
						correctAnswerIndex: 0,
					},
					{
						question: 'Technology in lesson planning can:',
						options: ['Track student progress', 'Replace teacher entirely', 'Distract students', 'Reduce learning'],
						correctAnswerIndex: 0,
					},
					{
						question: 'Which is a problem-solving activity?',
						options: ['Memorizing notes', 'Applying knowledge to real scenarios', 'Reading silently', 'Copying homework'],
						correctAnswerIndex: 1,
					},
					{
						question: 'A well-designed assessment:',
						options: ['Tests only memorization', 'Measures understanding and progress', 'Punishes weak learners', 'Ignores effort'],
						correctAnswerIndex: 1,
					},
					{
						question: 'Effective lesson planning ensures:',
						options: ['Lessons are purposeful and engaging', 'Lessons are boring', 'Students are confused', 'Teachers are unprepared'],
						correctAnswerIndex: 0,
					},
				],
			},
			{
				id: 's4',
				title: 'Classroom Management & Discipline Strategies',
				description: 'Understand principles of effective classroom management, apply strategies to maintain discipline and engagement, address challenging behaviors constructively, and create a positive learning environment.',
				content: {
					html: `<div class="space-y-10">
						<div class="space-y-6">
							<h1 class="text-3xl font-bold text-primary mb-2">Module 4: Classroom Management & Discipline Strategies</h1>
							<p class="text-muted-foreground mb-6">(Duration: ~60 minutes)</p>

							<div class="bg-primary/5 border-l-4 border-primary p-4 rounded-r-lg">
								<h3 class="font-bold text-lg mb-3 text-primary">🎯 Learning Objectives</h3>
								<p class="text-sm mb-2">By the end of this module, tutors will be able to:</p>
								<ul class="list-disc list-inside space-y-2 text-sm text-muted-foreground ml-4">
									<li>Understand the principles of effective classroom management</li>
									<li>Apply strategies to maintain discipline and engagement</li>
									<li>Address challenging behaviors constructively</li>
									<li>Create a positive and inclusive learning environment</li>
									<li>Use digital tools to support classroom management</li>
								</ul>
							</div>
						</div>

						<div class="space-y-6">
							<h2 class="text-2xl font-bold text-primary">4.1 Principles of Effective Classroom Management</h2>
							<ul class="list-disc list-inside space-y-2 text-sm text-muted-foreground ml-4">
								<li>Set clear rules and expectations from day one</li>
								<li>Maintain consistency and fairness</li>
								<li>Foster mutual respect between tutor and students</li>
								<li>Use proactive strategies rather than reactive punishment</li>
							</ul>
							<div class="bg-primary/5 p-4 rounded-lg my-4">
								<p class="font-semibold mb-2">Example:</p>
								<p class="text-sm text-muted-foreground">Establish a "classroom agreement" where students and tutors co-create rules.</p>
							</div>
						</div>

						<div class="space-y-6">
							<h2 class="text-2xl font-bold text-primary">4.2 Positive Behavior Strategies</h2>
							<ul class="list-disc list-inside space-y-2 text-sm text-muted-foreground ml-4">
								<li>Praise and reward desirable behavior</li>
								<li>Encourage student participation and responsibility</li>
								<li>Use reminders and gentle corrections before escalation</li>
								<li>Recognize individual differences and needs</li>
							</ul>
							<div class="bg-primary/5 p-4 rounded-lg my-4">
								<p class="font-semibold text-sm mb-2">💡 Tip:</p>
								<p class="text-sm text-muted-foreground">Use a token system or point chart for motivation.</p>
							</div>
							<div class="bg-secondary/5 p-4 rounded-lg my-4">
								<p class="font-semibold mb-2">Example:</p>
								<p class="text-sm text-muted-foreground">A student who participates actively earns points towards a class privilege.</p>
							</div>
						</div>

						<div class="space-y-6">
							<h2 class="text-2xl font-bold text-primary">4.3 Handling Challenging Behaviors</h2>
							<div class="relative overflow-x-auto shadow-sm rounded-lg my-4">
								<table class="w-full text-sm">
									<thead class="bg-primary/5">
										<tr>
											<th class="px-4 py-3 text-left font-semibold">Behavior</th>
											<th class="px-4 py-3 text-left font-semibold">Strategy</th>
										</tr>
									</thead>
									<tbody>
										<tr class="border-b border-primary/10">
											<td class="px-4 py-3 font-medium">Disruption / talking out of turn</td>
											<td class="px-4 py-3">Redirect politely, remind class rules</td>
										</tr>
										<tr class="border-b border-primary/10">
											<td class="px-4 py-3 font-medium">Non-participation</td>
											<td class="px-4 py-3">Assign roles in group activities, provide encouragement</td>
										</tr>
										<tr class="border-b border-primary/10">
											<td class="px-4 py-3 font-medium">Bullying</td>
											<td class="px-4 py-3">Mediate calmly, involve counselor if needed</td>
										</tr>
										<tr class="border-b border-primary/10">
											<td class="px-4 py-3 font-medium">Defiance / disrespect</td>
											<td class="px-4 py-3">Discuss privately, set clear expectations</td>
										</tr>
									</tbody>
								</table>
							</div>
						</div>

						<div class="space-y-6">
							<h2 class="text-2xl font-bold text-primary">4.4 Creating a Positive Learning Environment</h2>
							<ul class="list-disc list-inside space-y-2 text-sm text-muted-foreground ml-4">
								<li>Arrange the classroom to promote interaction and focus</li>
								<li>Encourage inclusivity and respect for diversity</li>
								<li>Incorporate engaging materials and technology</li>
								<li>Foster collaboration and peer support</li>
							</ul>
							<div class="bg-primary/5 p-4 rounded-lg my-4">
								<p class="font-semibold mb-2">Example:</p>
								<p class="text-sm text-muted-foreground">Mixed-ability group work encourages teamwork and inclusion.</p>
							</div>
						</div>

						<div class="space-y-6">
							<h2 class="text-2xl font-bold text-primary">4.5 Technology to Support Management</h2>
							<ul class="list-disc list-inside space-y-2 text-sm text-muted-foreground ml-4">
								<li>Use Google Classroom or Microsoft Teams for assignments and announcements</li>
								<li>Track attendance and participation digitally</li>
								<li>Gamify behavior tracking with apps like ClassDojo</li>
							</ul>
							<div class="bg-primary/5 p-4 rounded-lg my-4">
								<p class="font-semibold text-sm mb-2">💡 Tip:</p>
								<p class="text-sm text-muted-foreground">Technology should supplement, not replace, personal engagement with students.</p>
							</div>
						</div>

						<div class="space-y-6">
							<h2 class="text-2xl font-bold text-primary">✅ Module 4 Summary</h2>
							<ul class="list-disc list-inside space-y-2 text-sm text-muted-foreground ml-4">
								<li>Effective classroom management combines clear rules, positive reinforcement, and consistent expectations</li>
								<li>Tutors must address challenging behaviors constructively</li>
								<li>Positive learning environments and inclusivity enhance engagement</li>
								<li>Technology can support, but not replace, personal interaction</li>
								<li>Tutors play a key role in guiding behavior while promoting learning</li>
							</ul>
						</div>
					</div>`,
					videos: [
						{ youtubeUrl: '', caption: 'Classroom Management Strategies' },
						{ youtubeUrl: '', caption: 'Positive Behavior Management' },
					],
				},
				sections: [
					{
						id: 's4s1',
						title: '4.1 Principles of Effective Classroom Management',
						html: `<div class="space-y-4">
							<p class="text-muted-foreground">Set clear rules and expectations from day one, maintain consistency and fairness, foster mutual respect, and use proactive strategies rather than reactive punishment. Establish a "classroom agreement" where students and tutors co-create rules.</p>
						</div>`,
						youtubeUrl: '',
						caption: 'Classroom Management Principles',
					},
					{
						id: 's4s2',
						title: '4.2 Positive Behavior Strategies',
						html: `<div class="space-y-4">
							<p class="text-muted-foreground">Praise and reward desirable behavior, encourage participation and responsibility, use reminders and gentle corrections, and recognize individual differences. Use a token system or point chart for motivation.</p>
						</div>`,
						youtubeUrl: '',
						caption: 'Positive Behavior Strategies',
					},
					{
						id: 's4s3',
						title: '4.3 Handling Challenging Behaviors',
						html: `<div class="space-y-4">
							<p class="text-muted-foreground">Strategies include: disruption (redirect politely), non-participation (assign roles, provide encouragement), bullying (mediate calmly, involve counselor), defiance (discuss privately, set clear expectations).</p>
						</div>`,
						youtubeUrl: '',
						caption: 'Handling Challenging Behaviors',
					},
					{
						id: 's4s4',
						title: '4.4 Creating a Positive Learning Environment',
						html: `<div class="space-y-4">
							<p class="text-muted-foreground">Arrange classroom to promote interaction, encourage inclusivity and respect for diversity, incorporate engaging materials and technology, and foster collaboration. Mixed-ability group work encourages teamwork.</p>
						</div>`,
						youtubeUrl: '',
						caption: 'Positive Learning Environment',
					},
					{
						id: 's4s5',
						title: '4.5 Technology to Support Management',
						html: `<div class="space-y-4">
							<p class="text-muted-foreground">Use Google Classroom or Microsoft Teams for assignments, track attendance digitally, and gamify behavior tracking with apps like ClassDojo. Technology should supplement, not replace, personal engagement.</p>
						</div>`,
						youtubeUrl: '',
						caption: 'Technology in Management',
					},
				],
				quiz: [
					{
						question: 'Effective classroom management begins with:',
						options: ['Strict punishment only', 'Clear rules and expectations', 'Ignoring misbehavior', 'Giving no instructions'],
						correctAnswerIndex: 1,
					},
					{
						question: 'Positive behavior strategies include:',
						options: ['Ignoring good behavior', 'Praising and rewarding', 'Punishing immediately', 'Criticizing publicly'],
						correctAnswerIndex: 1,
					},
					{
						question: 'Handling disruptions best involves:',
						options: ['Escalating quickly', 'Redirecting politely', 'Ignoring completely', 'Punishing harshly'],
						correctAnswerIndex: 1,
					},
					{
						question: 'Inclusion in class means:',
						options: ['Ignoring quiet students', 'Encouraging participation from all', 'Favoring top students', 'Comparing students harshly'],
						correctAnswerIndex: 1,
					},
					{
						question: 'Technology can help classroom management by:',
						options: ['Replacing the tutor', 'Tracking attendance and participation', 'Distracting students', 'Ignoring behavior'],
						correctAnswerIndex: 1,
					},
					{
						question: 'A positive learning environment encourages:',
						options: ['Competition only', 'Respect, collaboration, engagement', 'Fear of mistakes', 'Isolation'],
						correctAnswerIndex: 1,
					},
					{
						question: 'Token reward systems are used to:',
						options: ['Track attendance', 'Motivate and reinforce behavior', 'Punish misbehavior', 'Replace teaching'],
						correctAnswerIndex: 1,
					},
					{
						question: 'Challenging behaviors should be:',
						options: ['Punished immediately', 'Addressed constructively', 'Ignored entirely', 'Publicly embarrassed'],
						correctAnswerIndex: 1,
					},
					{
						question: 'A classroom agreement is:',
						options: ['A tutor-only rule list', 'Rules co-created with students', 'Ignored', 'A punishment chart only'],
						correctAnswerIndex: 1,
					},
					{
						question: 'Consistency in management means:',
						options: ['Same rules applied fairly', 'Changing rules daily', 'Favoring certain students', 'Ignoring misbehavior'],
						correctAnswerIndex: 0,
					},
					{
						question: 'Encouraging responsibility in students involves:',
						options: ['Assigning tasks and roles', 'Doing work for them', 'Ignoring participation', 'Strictly lecturing'],
						correctAnswerIndex: 0,
					},
					{
						question: 'Addressing bullying may require:',
						options: ['Mediation and counselor involvement', 'Ignoring it', 'Public shaming', 'Punishing the entire class'],
						correctAnswerIndex: 0,
					},
					{
						question: 'Classroom layout can:',
						options: ['Promote interaction and focus', 'Distract learners', 'Be irrelevant', 'Cause confusion'],
						correctAnswerIndex: 0,
					},
					{
						question: 'Positive reinforcement is:',
						options: ['Rewarding desirable behavior', 'Ignoring effort', 'Criticizing publicly', 'Threatening students'],
						correctAnswerIndex: 0,
					},
					{
						question: 'The tutor\'s role in behavior management is to:',
						options: ['Punish harshly', 'Support and guide students', 'Ignore students', 'Focus on content only'],
						correctAnswerIndex: 1,
					},
				],
			},
			{
				id: 's5',
				title: 'Motivation & Engagement Strategies for Secondary Learners',
				description: 'Identify factors that motivate secondary students, apply strategies to increase engagement, use interactive teaching approaches, and encourage intrinsic and extrinsic motivation.',
				content: {
					html: `<div class="space-y-10">
						<div class="space-y-6">
							<h1 class="text-3xl font-bold text-primary mb-2">Module 5: Motivation & Engagement Strategies for Secondary Learners</h1>
							<p class="text-muted-foreground mb-6">(Duration: ~60 minutes)</p>
							<div class="bg-primary/5 border-l-4 border-primary p-4 rounded-r-lg">
								<h3 class="font-bold text-lg mb-3 text-primary">🎯 Learning Objectives</h3>
								<p class="text-sm mb-2">By the end of this module, tutors will be able to:</p>
								<ul class="list-disc list-inside space-y-2 text-sm text-muted-foreground ml-4">
									<li>Identify factors that motivate secondary students</li>
									<li>Apply strategies to increase classroom engagement</li>
									<li>Use interactive and student-centered teaching approaches</li>
									<li>Encourage intrinsic and extrinsic motivation</li>
									<li>Monitor and sustain student participation and interest</li>
								</ul>
							</div>
						</div>
						<div class="space-y-6">
							<h2 class="text-2xl font-bold text-primary">5.1 Understanding Student Motivation</h2>
							<p class="text-muted-foreground">Motivation drives learning behavior and performance. Adolescents are influenced by:</p>
							<ul class="list-disc list-inside space-y-2 text-sm text-muted-foreground ml-4">
								<li><strong>Intrinsic motivation:</strong> Desire to learn for personal satisfaction</li>
								<li><strong>Extrinsic motivation:</strong> Rewards, praise, recognition, or grades</li>
								<li><strong>Goal orientation:</strong> Academic, social, or personal achievements</li>
							</ul>
							<div class="bg-primary/5 p-4 rounded-lg my-4">
								<p class="font-semibold mb-2">Example:</p>
								<p class="text-sm text-muted-foreground">A student may study hard for personal satisfaction (intrinsic) or to win a class competition (extrinsic).</p>
							</div>
						</div>
						<div class="space-y-6">
							<h2 class="text-2xl font-bold text-primary">5.2 Strategies to Enhance Engagement</h2>
							<div class="relative overflow-x-auto shadow-sm rounded-lg my-4">
								<table class="w-full text-sm">
									<thead class="bg-primary/5">
										<tr>
											<th class="px-4 py-3 text-left font-semibold">Strategy</th>
											<th class="px-4 py-3 text-left font-semibold">Description</th>
											<th class="px-4 py-3 text-left font-semibold">Example</th>
										</tr>
									</thead>
									<tbody>
										<tr class="border-b border-primary/10">
											<td class="px-4 py-3 font-medium">Active learning</td>
											<td class="px-4 py-3">Hands-on activities and problem-solving</td>
											<td class="px-4 py-3">Science experiment, coding project</td>
										</tr>
										<tr class="border-b border-primary/10">
											<td class="px-4 py-3 font-medium">Collaborative learning</td>
											<td class="px-4 py-3">Group work and peer interaction</td>
											<td class="px-4 py-3">Group debates, project presentations</td>
										</tr>
										<tr class="border-b border-primary/10">
											<td class="px-4 py-3 font-medium">Gamification</td>
											<td class="px-4 py-3">Use of points, rewards, or competitions</td>
											<td class="px-4 py-3">Kahoot quizzes or leaderboards</td>
										</tr>
										<tr class="border-b border-primary/10">
											<td class="px-4 py-3 font-medium">Choice & autonomy</td>
											<td class="px-4 py-3">Allow students to select topics or tasks</td>
											<td class="px-4 py-3">Project topics, research questions</td>
										</tr>
										<tr class="border-b border-primary/10">
											<td class="px-4 py-3 font-medium">Relevance</td>
											<td class="px-4 py-3">Connect lessons to real life</td>
											<td class="px-4 py-3">Applying math to budgeting</td>
										</tr>
									</tbody>
								</table>
							</div>
						</div>
						<div class="space-y-6">
							<h2 class="text-2xl font-bold text-primary">5.3 Encouraging Intrinsic Motivation</h2>
							<ul class="list-disc list-inside space-y-2 text-sm text-muted-foreground ml-4">
								<li>Set challenging but achievable goals</li>
								<li>Provide meaningful feedback</li>
								<li>Encourage curiosity and exploration</li>
								<li>Foster self-reflection and ownership of learning</li>
							</ul>
							<div class="bg-primary/5 p-4 rounded-lg my-4">
								<p class="font-semibold mb-2">Example:</p>
								<p class="text-sm text-muted-foreground">Let students design a project related to their personal interests within a subject.</p>
							</div>
						</div>
						<div class="space-y-6">
							<h2 class="text-2xl font-bold text-primary">5.4 Monitoring and Sustaining Engagement</h2>
							<ul class="list-disc list-inside space-y-2 text-sm text-muted-foreground ml-4">
								<li>Observe participation and body language</li>
								<li>Ask open-ended questions</li>
								<li>Rotate roles and responsibilities</li>
								<li>Break lessons into short, interactive segments</li>
								<li>Use technology thoughtfully (interactive quizzes, multimedia)</li>
							</ul>
						</div>
						<div class="space-y-6">
							<h2 class="text-2xl font-bold text-primary">✅ Module 5 Summary</h2>
							<ul class="list-disc list-inside space-y-2 text-sm text-muted-foreground ml-4">
								<li>Motivation includes intrinsic (personal satisfaction) and extrinsic (rewards) factors</li>
								<li>Active learning, collaboration, gamification, choice, and relevance enhance engagement</li>
								<li>Intrinsic motivation is supported through challenging goals and meaningful feedback</li>
								<li>Monitoring engagement requires observation, questioning, and varied activities</li>
							</ul>
						</div>
					</div>`,
					videos: [
						{ youtubeUrl: '', caption: 'Student Motivation Strategies' },
						{ youtubeUrl: '', caption: 'Engagement Techniques' },
					],
				},
				sections: [
					{
						id: 's5s1',
						title: '5.1 Understanding Student Motivation',
						html: `<div class="space-y-4"><p class="text-muted-foreground">Motivation includes intrinsic (personal satisfaction) and extrinsic (rewards, praise, grades) factors, plus goal orientation (academic, social, personal achievements).</p></div>`,
						youtubeUrl: '',
						caption: 'Student Motivation',
					},
					{
						id: 's5s2',
						title: '5.2 Strategies to Enhance Engagement',
						html: `<div class="space-y-4"><p class="text-muted-foreground">Strategies include active learning (hands-on activities), collaborative learning (group work), gamification (points, rewards), choice & autonomy (student selection), and relevance (real-life connections).</p></div>`,
						youtubeUrl: '',
						caption: 'Engagement Strategies',
					},
					{
						id: 's5s3',
						title: '5.3 Encouraging Intrinsic Motivation',
						html: `<div class="space-y-4"><p class="text-muted-foreground">Set challenging but achievable goals, provide meaningful feedback, encourage curiosity, and foster self-reflection. Let students design projects related to personal interests.</p></div>`,
						youtubeUrl: '',
						caption: 'Intrinsic Motivation',
					},
					{
						id: 's5s4',
						title: '5.4 Monitoring and Sustaining Engagement',
						html: `<div class="space-y-4"><p class="text-muted-foreground">Observe participation and body language, ask open-ended questions, rotate roles, break lessons into short segments, and use technology thoughtfully.</p></div>`,
						youtubeUrl: '',
						caption: 'Sustaining Engagement',
					},
				],
				quiz: [
					{
						question: 'Intrinsic motivation comes from:',
						options: ['Desire to earn rewards', 'Personal satisfaction', 'Teacher pressure', 'Peer competition'],
						correctAnswerIndex: 1,
					},
					{
						question: 'Extrinsic motivation is influenced by:',
						options: ['Curiosity', 'Rewards and recognition', 'Self-reflection', 'Personal interest'],
						correctAnswerIndex: 1,
					},
					{
						question: 'Which strategy promotes active learning?',
						options: ['Lecturing only', 'Hands-on experiments', 'Silent reading', 'Assigning homework only'],
						correctAnswerIndex: 1,
					},
					{
						question: 'Collaborative learning involves:',
						options: ['Individual tasks only', 'Peer interaction and teamwork', 'Ignoring peers', 'Testing only'],
						correctAnswerIndex: 1,
					},
					{
						question: 'Gamification can include:',
						options: ['Quizzes with points', 'Ignoring participation', 'Lecturing for long hours', 'Punishments'],
						correctAnswerIndex: 0,
					},
					{
						question: 'Offering students choice increases:',
						options: ['Motivation and engagement', 'Confusion', 'Boredom', 'Misbehavior'],
						correctAnswerIndex: 0,
					},
					{
						question: 'Making lessons relevant:',
						options: ['Connects learning to real life', 'Focuses only on memorization', 'Ignores student interest', 'Replaces discussion'],
						correctAnswerIndex: 0,
					},
					{
						question: 'Providing feedback helps:',
						options: ['Discourage students', 'Improve performance and motivation', 'Confuse learners', 'Punish students'],
						correctAnswerIndex: 1,
					},
					{
						question: 'Rotating classroom roles encourages:',
						options: ['Participation and engagement', 'Laziness', 'Distraction', 'Competition only'],
						correctAnswerIndex: 0,
					},
					{
						question: 'Intrinsic motivation is best supported by:',
						options: ['Punishments', 'Encouraging curiosity', 'Ignoring student work', 'Only grading'],
						correctAnswerIndex: 1,
					},
					{
						question: 'Which tool can increase engagement digitally?',
						options: ['Kahoot', 'Email only', 'PowerPoint slides with no interaction', 'Silent reading'],
						correctAnswerIndex: 0,
					},
					{
						question: 'Open-ended questions:',
						options: ['Encourage critical thinking', 'Limit participation', 'Are unnecessary', 'Confuse students'],
						correctAnswerIndex: 0,
					},
					{
						question: 'Monitoring body language helps tutors:',
						options: ['Assess engagement', 'Punish students', 'Ignore learning gaps', 'Replace teaching'],
						correctAnswerIndex: 0,
					},
					{
						question: 'Choice and autonomy in learning:',
						options: ['Discourage creativity', 'Encourage ownership', 'Reduce responsibility', 'Focus on rewards only'],
						correctAnswerIndex: 1,
					},
					{
						question: 'Breaking lessons into short segments:',
						options: ['Maintains attention and engagement', 'Confuses students', 'Reduces participation', 'Increases boredom'],
						correctAnswerIndex: 0,
					},
				],
			},
			{
				id: 's6',
				title: 'Inclusive Education & Diversity Strategies',
				description: 'Understand principles of inclusive education, recognize learner diversity, adapt teaching strategies, promote equality and respect, and address barriers to learning.',
				content: {
					html: `<div class="space-y-10">
						<div class="space-y-6">
							<h1 class="text-3xl font-bold text-primary mb-2">Module 6: Inclusive Education & Diversity Strategies</h1>
							<p class="text-muted-foreground mb-6">(Duration: ~60 minutes)</p>
							<div class="bg-primary/5 border-l-4 border-primary p-4 rounded-r-lg">
								<h3 class="font-bold text-lg mb-3 text-primary">🎯 Learning Objectives</h3>
								<p class="text-sm mb-2">By the end of this module, tutors will be able to:</p>
								<ul class="list-disc list-inside space-y-2 text-sm text-muted-foreground ml-4">
									<li>Understand the principles of inclusive education</li>
									<li>Recognize learner diversity in abilities, culture, and learning styles</li>
									<li>Adapt teaching strategies to meet all learners' needs</li>
									<li>Promote equality, respect, and participation in the classroom</li>
									<li>Address barriers to learning effectively</li>
								</ul>
							</div>
						</div>
						<div class="space-y-6">
							<h2 class="text-2xl font-bold text-primary">6.1 Understanding Inclusive Education</h2>
							<p class="text-muted-foreground">Inclusive education ensures all learners have access to quality education regardless of:</p>
							<ul class="list-disc list-inside space-y-2 text-sm text-muted-foreground ml-4">
								<li>Physical or learning disabilities</li>
								<li>Gender, culture, or language differences</li>
								<li>Socio-economic background</li>
								<li>Learning pace or style</li>
							</ul>
							<div class="bg-primary/5 p-4 rounded-lg my-4">
								<p class="font-semibold mb-2">Example:</p>
								<p class="text-sm text-muted-foreground">Adapting a lesson so a visually impaired student can participate using audio materials.</p>
							</div>
						</div>
						<div class="space-y-6">
							<h2 class="text-2xl font-bold text-primary">6.2 Recognizing Diversity</h2>
							<p class="text-muted-foreground">Diversity in secondary classrooms includes:</p>
							<ul class="list-disc list-inside space-y-2 text-sm text-muted-foreground ml-4">
								<li><strong>Cognitive diversity:</strong> Different learning speeds and problem-solving approaches</li>
								<li><strong>Cultural diversity:</strong> Varied backgrounds and languages</li>
								<li><strong>Physical diversity:</strong> Mobility, hearing, vision, or other special needs</li>
								<li><strong>Emotional diversity:</strong> Different personalities, social skills, and confidence levels</li>
							</ul>
							<div class="bg-primary/5 p-4 rounded-lg my-4">
								<p class="font-semibold text-sm mb-2">💡 Tip:</p>
								<p class="text-sm text-muted-foreground">Observe students' learning preferences and adapt accordingly.</p>
							</div>
						</div>
						<div class="space-y-6">
							<h2 class="text-2xl font-bold text-primary">6.3 Strategies for Inclusive Teaching</h2>
							<div class="relative overflow-x-auto shadow-sm rounded-lg my-4">
								<table class="w-full text-sm">
									<thead class="bg-primary/5">
										<tr>
											<th class="px-4 py-3 text-left font-semibold">Strategy</th>
											<th class="px-4 py-3 text-left font-semibold">Description</th>
											<th class="px-4 py-3 text-left font-semibold">Example</th>
										</tr>
									</thead>
									<tbody>
										<tr class="border-b border-primary/10">
											<td class="px-4 py-3 font-medium">Differentiated instruction</td>
											<td class="px-4 py-3">Adjust lessons for different abilities</td>
											<td class="px-4 py-3">Provide extra support or extension tasks</td>
										</tr>
										<tr class="border-b border-primary/10">
											<td class="px-4 py-3 font-medium">Multisensory teaching</td>
											<td class="px-4 py-3">Use visual, auditory, and kinesthetic methods</td>
											<td class="px-4 py-3">Combine diagrams, storytelling, and hands-on activities</td>
										</tr>
										<tr class="border-b border-primary/10">
											<td class="px-4 py-3 font-medium">Collaborative learning</td>
											<td class="px-4 py-3">Encourage peer support</td>
											<td class="px-4 py-3">Group projects or buddy systems</td>
										</tr>
										<tr class="border-b border-primary/10">
											<td class="px-4 py-3 font-medium">Culturally responsive teaching</td>
											<td class="px-4 py-3">Include diverse perspectives</td>
											<td class="px-4 py-3">Incorporate stories, examples, and languages from learners' backgrounds</td>
										</tr>
									</tbody>
								</table>
							</div>
						</div>
						<div class="space-y-6">
							<h2 class="text-2xl font-bold text-primary">6.4 Removing Barriers to Learning</h2>
							<ul class="list-disc list-inside space-y-2 text-sm text-muted-foreground ml-4">
								<li>Provide accessible resources (large print, audio, captions)</li>
								<li>Use assistive technologies (screen readers, voice-to-text apps)</li>
								<li>Modify assessments without lowering standards</li>
								<li>Promote a supportive and respectful classroom climate</li>
							</ul>
							<div class="bg-primary/5 p-4 rounded-lg my-4">
								<p class="font-semibold mb-2">Example:</p>
								<p class="text-sm text-muted-foreground">A student with dyslexia may submit an oral presentation instead of a written essay.</p>
							</div>
						</div>
						<div class="space-y-6">
							<h2 class="text-2xl font-bold text-primary">6.5 Promoting Equality & Respect</h2>
							<ul class="list-disc list-inside space-y-2 text-sm text-muted-foreground ml-4">
								<li>Model respectful behavior and celebrate differences</li>
								<li>Encourage all students to contribute</li>
								<li>Address bias, stereotypes, or discriminatory behavior immediately</li>
								<li>Recognize achievements fairly and inclusively</li>
							</ul>
							<div class="bg-primary/5 p-4 rounded-lg my-4">
								<p class="font-semibold text-sm mb-2">💡 Tip:</p>
								<p class="text-sm text-muted-foreground">Class discussions can include perspectives from various cultures, genders, and abilities.</p>
							</div>
						</div>
						<div class="space-y-6">
							<h2 class="text-2xl font-bold text-primary">✅ Module 6 Summary</h2>
							<ul class="list-disc list-inside space-y-2 text-sm text-muted-foreground ml-4">
								<li>Inclusive education ensures all learners have access to quality education</li>
								<li>Diversity includes cognitive, cultural, physical, and emotional differences</li>
								<li>Strategies include differentiated instruction, multisensory teaching, and collaboration</li>
								<li>Removing barriers requires accessible resources and assistive technologies</li>
								<li>Promoting equality and respect creates a supportive learning environment</li>
							</ul>
						</div>
					</div>`,
					videos: [
						{ youtubeUrl: '', caption: 'Inclusive Education Principles' },
						{ youtubeUrl: '', caption: 'Diversity Strategies' },
					],
				},
				sections: [
					{
						id: 's6s1',
						title: '6.1 Understanding Inclusive Education',
						html: `<div class="space-y-4"><p class="text-muted-foreground">Inclusive education ensures all learners have access regardless of disabilities, gender, culture, language, socio-economic background, or learning pace. Example: Adapt lessons for visually impaired students using audio materials.</p></div>`,
						youtubeUrl: '',
						caption: 'Inclusive Education',
					},
					{
						id: 's6s2',
						title: '6.2 Recognizing Diversity',
						html: `<div class="space-y-4"><p class="text-muted-foreground">Diversity includes cognitive (learning speeds), cultural (backgrounds, languages), physical (mobility, hearing, vision), and emotional (personalities, social skills). Observe learning preferences and adapt accordingly.</p></div>`,
						youtubeUrl: '',
						caption: 'Recognizing Diversity',
					},
					{
						id: 's6s3',
						title: '6.3 Strategies for Inclusive Teaching',
						html: `<div class="space-y-4"><p class="text-muted-foreground">Strategies include differentiated instruction (adjust for abilities), multisensory teaching (visual, auditory, kinesthetic), collaborative learning (peer support), and culturally responsive teaching (diverse perspectives).</p></div>`,
						youtubeUrl: '',
						caption: 'Inclusive Teaching Strategies',
					},
					{
						id: 's6s4',
						title: '6.4 Removing Barriers to Learning',
						html: `<div class="space-y-4"><p class="text-muted-foreground">Provide accessible resources (large print, audio, captions), use assistive technologies (screen readers, voice-to-text), modify assessments without lowering standards, and promote a supportive climate. Example: Student with dyslexia submits oral presentation instead of essay.</p></div>`,
						youtubeUrl: '',
						caption: 'Removing Barriers',
					},
					{
						id: 's6s5',
						title: '6.5 Promoting Equality & Respect',
						html: `<div class="space-y-4"><p class="text-muted-foreground">Model respectful behavior, celebrate differences, encourage all students to contribute, address bias immediately, and recognize achievements fairly. Include perspectives from various cultures, genders, and abilities in discussions.</p></div>`,
						youtubeUrl: '',
						caption: 'Equality & Respect',
					},
				],
				quiz: [
					{
						question: 'Inclusive education ensures:',
						options: ['Only high-achieving students succeed', 'All learners have access to quality education', 'Students compete unfairly', 'Tutors teach only one learning style'],
						correctAnswerIndex: 1,
					},
					{
						question: 'Diversity in the classroom includes:',
						options: ['Culture, ability, and learning styles', 'Only gender', 'Only socio-economic status', 'Nothing'],
						correctAnswerIndex: 0,
					},
					{
						question: 'Differentiated instruction means:',
						options: ['Same lesson for everyone', 'Adjusting lessons to learners\' needs', 'Lowering standards', 'Ignoring students'],
						correctAnswerIndex: 1,
					},
					{
						question: 'Multisensory teaching uses:',
						options: ['Only reading', 'Visual, auditory, and hands-on methods', 'Only exams', 'Memorization only'],
						correctAnswerIndex: 1,
					},
					{
						question: 'Collaborative learning encourages:',
						options: ['Peer support', 'Individual isolation', 'Competition only', 'Ignoring quiet students'],
						correctAnswerIndex: 0,
					},
					{
						question: 'Assistive technologies include:',
						options: ['Screen readers and voice-to-text apps', 'Only textbooks', 'Games unrelated to learning', 'Random websites'],
						correctAnswerIndex: 0,
					},
					{
						question: 'Removing barriers to learning means:',
						options: ['Ignoring special needs', 'Providing accessible resources', 'Lowering standards', 'Excluding students'],
						correctAnswerIndex: 1,
					},
					{
						question: 'Culturally responsive teaching involves:',
						options: ['Ignoring student backgrounds', 'Including diverse perspectives', 'Only teaching local content', 'Avoiding discussion'],
						correctAnswerIndex: 1,
					},
					{
						question: 'Tutors promote equality by:',
						options: ['Celebrating diversity', 'Favoring top students', 'Ignoring quiet students', 'Punishing mistakes harshly'],
						correctAnswerIndex: 0,
					},
					{
						question: 'A student with a physical disability should:',
						options: ['Be excluded', 'Be provided with assistive tools', 'Sit at the back without support', 'Do no work'],
						correctAnswerIndex: 1,
					},
					{
						question: 'Respectful classrooms encourage:',
						options: ['Participation from all', 'Only top performers', 'Gossip and bullying', 'Silence only'],
						correctAnswerIndex: 0,
					},
					{
						question: 'Observing student learning preferences helps tutors:',
						options: ['Adapt instruction effectively', 'Punish students', 'Ignore differences', 'Reduce engagement'],
						correctAnswerIndex: 0,
					},
					{
						question: 'Inclusive assessment may involve:',
						options: ['Same test for everyone', 'Modifications without lowering standards', 'Lowering grades arbitrarily', 'Ignoring learning gaps'],
						correctAnswerIndex: 1,
					},
					{
						question: 'Which tool helps students with dyslexia?',
						options: ['Read&Write', 'Random games', 'Social media', 'Pen and paper only'],
						correctAnswerIndex: 0,
					},
					{
						question: 'The main goal of inclusive education is:',
						options: ['Excluding students with difficulties', 'Ensuring fairness and access for all', 'Teaching one method', 'Focusing only on top achievers'],
						correctAnswerIndex: 1,
					},
				],
			},
			{
				id: 's7',
				title: 'Effective Communication & Teacher-Student Relationships',
				description: 'Understand the role of communication in teaching, apply verbal, non-verbal, and digital communication effectively, build positive relationships, and use communication to manage behavior and foster engagement.',
				content: {
					html: `<div class="space-y-10">
						<div class="space-y-6">
							<h1 class="text-3xl font-bold text-primary mb-2">Module 7: Effective Communication & Teacher-Student Relationships</h1>
							<p class="text-muted-foreground mb-6">(Duration: ~60 minutes)</p>
							<div class="bg-primary/5 border-l-4 border-primary p-4 rounded-r-lg">
								<h3 class="font-bold text-lg mb-3 text-primary">🎯 Learning Objectives</h3>
								<p class="text-sm mb-2">By the end of this module, tutors will be able to:</p>
								<ul class="list-disc list-inside space-y-2 text-sm text-muted-foreground ml-4">
									<li>Understand the role of communication in teaching and learning</li>
									<li>Apply verbal, non-verbal, and digital communication effectively</li>
									<li>Build positive, respectful teacher-student relationships</li>
									<li>Listen actively and respond empathetically</li>
									<li>Use communication to manage classroom behavior and foster engagement</li>
								</ul>
							</div>
						</div>
						<div class="space-y-6">
							<h2 class="text-2xl font-bold text-primary">7.1 Importance of Communication in Teaching</h2>
							<ul class="list-disc list-inside space-y-2 text-sm text-muted-foreground ml-4">
								<li>Effective communication ensures clarity, understanding, and engagement</li>
								<li>Helps tutors convey instructions, explain concepts, and give feedback</li>
								<li>Builds trust, rapport, and motivation among students</li>
							</ul>
							<div class="bg-primary/5 p-4 rounded-lg my-4">
								<p class="font-semibold mb-2">Example:</p>
								<p class="text-sm text-muted-foreground">Giving clear step-by-step instructions for a science experiment reduces confusion and improves participation.</p>
							</div>
						</div>
						<div class="space-y-6">
							<h2 class="text-2xl font-bold text-primary">7.2 Verbal & Non-Verbal Communication</h2>
							<ul class="list-disc list-inside space-y-2 text-sm text-muted-foreground ml-4">
								<li><strong>Verbal:</strong> Tone, clarity, pace, and choice of words</li>
								<li><strong>Non-verbal:</strong> Eye contact, gestures, facial expressions, posture</li>
								<li><strong>Active listening:</strong> Show understanding, ask clarifying questions, paraphrase</li>
							</ul>
							<div class="bg-primary/5 p-4 rounded-lg my-4">
								<p class="font-semibold text-sm mb-2">💡 Tip:</p>
								<p class="text-sm text-muted-foreground">Match verbal and non-verbal signals for consistent communication.</p>
							</div>
						</div>
						<div class="space-y-6">
							<h2 class="text-2xl font-bold text-primary">7.3 Building Positive Relationships</h2>
							<ul class="list-disc list-inside space-y-2 text-sm text-muted-foreground ml-4">
								<li>Show respect, fairness, and consistency</li>
								<li>Demonstrate care and interest in students' well-being</li>
								<li>Encourage open dialogue and student voice</li>
								<li>Be approachable and available for guidance</li>
							</ul>
							<div class="bg-primary/5 p-4 rounded-lg my-4">
								<p class="font-semibold mb-2">Example:</p>
								<p class="text-sm text-muted-foreground">Greeting students warmly each day increases trust and participation.</p>
							</div>
						</div>
						<div class="space-y-6">
							<h2 class="text-2xl font-bold text-primary">7.4 Communication for Engagement & Discipline</h2>
							<ul class="list-disc list-inside space-y-2 text-sm text-muted-foreground ml-4">
								<li>Use clear instructions and expectations to prevent misunderstandings</li>
								<li>Give constructive feedback, not criticism</li>
								<li>Use reminders, redirection, and praise for behavior management</li>
								<li>Encourage peer feedback and collaborative discussion</li>
							</ul>
							<div class="bg-primary/5 p-4 rounded-lg my-4">
								<p class="font-semibold text-sm mb-2">💡 Tip:</p>
								<p class="text-sm text-muted-foreground">Avoid sarcasm or negative comments; maintain professionalism at all times.</p>
							</div>
						</div>
						<div class="space-y-6">
							<h2 class="text-2xl font-bold text-primary">7.5 Digital Communication</h2>
							<ul class="list-disc list-inside space-y-2 text-sm text-muted-foreground ml-4">
								<li>Use approved platforms for assignments and announcements</li>
								<li>Model professional behavior in emails, chats, and virtual classes</li>
								<li>Monitor student interactions online for safety and respect</li>
							</ul>
						</div>
						<div class="space-y-6">
							<h2 class="text-2xl font-bold text-primary">✅ Module 7 Summary</h2>
							<ul class="list-disc list-inside space-y-2 text-sm text-muted-foreground ml-4">
								<li>Effective communication is essential for understanding, engagement, and trust</li>
								<li>Tutors must combine verbal, non-verbal, and digital communication skills</li>
								<li>Positive relationships increase motivation and classroom participation</li>
								<li>Clear instructions, constructive feedback, and approachability improve behavior management</li>
								<li>Professionalism in both face-to-face and online communication is critical</li>
							</ul>
						</div>
					</div>`,
					videos: [
						{ youtubeUrl: '', caption: 'Effective Communication in Teaching' },
						{ youtubeUrl: '', caption: 'Building Teacher-Student Relationships' },
					],
				},
				sections: [
					{
						id: 's7s1',
						title: '7.1 Importance of Communication in Teaching',
						html: `<div class="space-y-4"><p class="text-muted-foreground">Effective communication ensures clarity, understanding, and engagement. It helps convey instructions, explain concepts, give feedback, and builds trust, rapport, and motivation. Example: Clear step-by-step instructions reduce confusion.</p></div>`,
						youtubeUrl: '',
						caption: 'Communication in Teaching',
					},
					{
						id: 's7s2',
						title: '7.2 Verbal & Non-Verbal Communication',
						html: `<div class="space-y-4"><p class="text-muted-foreground">Verbal includes tone, clarity, pace, and word choice. Non-verbal includes eye contact, gestures, facial expressions, posture. Active listening involves showing understanding, asking clarifying questions, and paraphrasing. Match verbal and non-verbal signals.</p></div>`,
						youtubeUrl: '',
						caption: 'Verbal & Non-Verbal Communication',
					},
					{
						id: 's7s3',
						title: '7.3 Building Positive Relationships',
						html: `<div class="space-y-4"><p class="text-muted-foreground">Show respect, fairness, and consistency. Demonstrate care and interest in students' well-being. Encourage open dialogue and student voice. Be approachable and available. Example: Greeting students warmly increases trust.</p></div>`,
						youtubeUrl: '',
						caption: 'Positive Relationships',
					},
					{
						id: 's7s4',
						title: '7.4 Communication for Engagement & Discipline',
						html: `<div class="space-y-4"><p class="text-muted-foreground">Use clear instructions and expectations, give constructive feedback (not criticism), use reminders and redirection, encourage peer feedback. Avoid sarcasm; maintain professionalism.</p></div>`,
						youtubeUrl: '',
						caption: 'Communication for Engagement',
					},
					{
						id: 's7s5',
						title: '7.5 Digital Communication',
						html: `<div class="space-y-4"><p class="text-muted-foreground">Use approved platforms for assignments and announcements. Model professional behavior in emails, chats, and virtual classes. Monitor student interactions online for safety and respect.</p></div>`,
						youtubeUrl: '',
						caption: 'Digital Communication',
					},
				],
				quiz: [
					{
						question: 'Effective communication in teaching ensures:',
						options: ['Clarity and understanding', 'Confusion', 'Only discipline', 'Ignoring students'],
						correctAnswerIndex: 0,
					},
					{
						question: 'Non-verbal communication includes:',
						options: ['Tone of voice', 'Eye contact, gestures', 'Written tests', 'Grading only'],
						correctAnswerIndex: 1,
					},
					{
						question: 'Active listening involves:',
						options: ['Interrupting students', 'Paraphrasing and asking clarifying questions', 'Ignoring student comments', 'Speaking only'],
						correctAnswerIndex: 1,
					},
					{
						question: 'Positive teacher-student relationships are built on:',
						options: ['Fairness, respect, and care', 'Strict rules only', 'Avoiding interaction', 'Favoritism'],
						correctAnswerIndex: 0,
					},
					{
						question: 'Constructive feedback should be:',
						options: ['Supportive and specific', 'Sarcastic', 'General criticism', 'Ignored'],
						correctAnswerIndex: 0,
					},
					{
						question: 'Teacher approachability increases:',
						options: ['Student trust and engagement', 'Misbehavior', 'Indifference', 'Confusion'],
						correctAnswerIndex: 0,
					},
					{
						question: 'Clear instructions help to:',
						options: ['Prevent misunderstandings', 'Encourage chaos', 'Reduce learning', 'Punish students'],
						correctAnswerIndex: 0,
					},
					{
						question: 'Digital communication should:',
						options: ['Follow professional guidelines', 'Ignore safety', 'Include private chats with students', 'Be unmonitored'],
						correctAnswerIndex: 0,
					},
					{
						question: 'Non-verbal cues should:',
						options: ['Contradict words', 'Match verbal messages', 'Be ignored', 'Only include gestures'],
						correctAnswerIndex: 1,
					},
					{
						question: 'Encouraging student voice means:',
						options: ['Listening and valuing opinions', 'Ignoring feedback', 'Punishing questions', 'Lecturing only'],
						correctAnswerIndex: 0,
					},
					{
						question: 'Peer feedback helps:',
						options: ['Foster collaboration', 'Create conflict', 'Reduce learning', 'Increase confusion'],
						correctAnswerIndex: 0,
					},
					{
						question: 'Avoid sarcasm in teaching because:',
						options: ['It builds rapport', 'It undermines respect', 'It motivates', 'It is funny'],
						correctAnswerIndex: 1,
					},
					{
						question: 'Teacher availability supports:',
						options: ['Student guidance and well-being', 'Indifference', 'Only grading', 'Misbehavior'],
						correctAnswerIndex: 0,
					},
					{
						question: 'Professional digital behavior includes:',
						options: ['Using approved platforms', 'Sharing passwords', 'Chatting privately with students', 'Posting unverified content'],
						correctAnswerIndex: 0,
					},
					{
						question: 'Clear teacher communication helps to:',
						options: ['Confuse students', 'Improve engagement and learning', 'Encourage misbehavior', 'Reduce participation'],
						correctAnswerIndex: 1,
					},
				],
			},
			{
				id: 's8',
				title: 'Effective Lesson Delivery & Teaching Techniques',
				description: 'Deliver lessons clearly and engagingly, apply varied teaching techniques, use questioning and demonstrations effectively, adapt to learning styles, and incorporate technology.',
				content: {
					html: `<div class="space-y-10">
						<div class="space-y-6">
							<h1 class="text-3xl font-bold text-primary mb-2">Module 8: Effective Lesson Delivery & Teaching Techniques</h1>
							<p class="text-muted-foreground mb-6">(Duration: ~60 minutes)</p>
							<div class="bg-primary/5 border-l-4 border-primary p-4 rounded-r-lg">
								<h3 class="font-bold text-lg mb-3 text-primary">🎯 Learning Objectives</h3>
								<p class="text-sm mb-2">By the end of this module, tutors will be able to:</p>
								<ul class="list-disc list-inside space-y-2 text-sm text-muted-foreground ml-4">
									<li>Deliver lessons clearly, confidently, and engagingly</li>
									<li>Apply a variety of teaching techniques suitable for secondary learners</li>
									<li>Use questioning, demonstrations, and hands-on activities effectively</li>
									<li>Adapt teaching methods to different learning styles</li>
									<li>Incorporate technology to enhance lesson delivery</li>
								</ul>
							</div>
						</div>
						<div class="space-y-6">
							<h2 class="text-2xl font-bold text-primary">8.1 Principles of Effective Lesson Delivery</h2>
							<ul class="list-disc list-inside space-y-2 text-sm text-muted-foreground ml-4">
								<li>Be well-prepared and organized</li>
								<li>Maintain clear learning objectives</li>
								<li>Speak clearly and confidently</li>
								<li>Engage students actively throughout the lesson</li>
								<li>Check for understanding regularly</li>
							</ul>
							<div class="bg-primary/5 p-4 rounded-lg my-4">
								<p class="font-semibold mb-2">Example:</p>
								<p class="text-sm text-muted-foreground">Begin a lesson with a short activity that connects prior knowledge to the new topic.</p>
							</div>
						</div>
						<div class="space-y-6">
							<h2 class="text-2xl font-bold text-primary">8.2 Teaching Techniques</h2>
							<div class="relative overflow-x-auto shadow-sm rounded-lg my-4">
								<table class="w-full text-sm">
									<thead class="bg-primary/5">
										<tr>
											<th class="px-4 py-3 text-left font-semibold">Technique</th>
											<th class="px-4 py-3 text-left font-semibold">Description</th>
											<th class="px-4 py-3 text-left font-semibold">Example</th>
										</tr>
									</thead>
									<tbody>
										<tr class="border-b border-primary/10">
											<td class="px-4 py-3 font-medium">Direct instruction</td>
											<td class="px-4 py-3">Explaining concepts clearly</td>
											<td class="px-4 py-3">Step-by-step math problem solution</td>
										</tr>
										<tr class="border-b border-primary/10">
											<td class="px-4 py-3 font-medium">Inquiry-based learning</td>
											<td class="px-4 py-3">Students explore and question</td>
											<td class="px-4 py-3">Science investigation on plant growth</td>
										</tr>
										<tr class="border-b border-primary/10">
											<td class="px-4 py-3 font-medium">Demonstration</td>
											<td class="px-4 py-3">Show how to perform a task</td>
											<td class="px-4 py-3">Lab experiment, art technique</td>
										</tr>
										<tr class="border-b border-primary/10">
											<td class="px-4 py-3 font-medium">Discussion</td>
											<td class="px-4 py-3">Encourage student participation</td>
											<td class="px-4 py-3">Debate on environmental issues</td>
										</tr>
										<tr class="border-b border-primary/10">
											<td class="px-4 py-3 font-medium">Problem-solving</td>
											<td class="px-4 py-3">Apply knowledge to real scenarios</td>
											<td class="px-4 py-3">Case study analysis</td>
										</tr>
										<tr class="border-b border-primary/10">
											<td class="px-4 py-3 font-medium">Collaborative learning</td>
											<td class="px-4 py-3">Group activities for peer learning</td>
											<td class="px-4 py-3">Group project or presentation</td>
										</tr>
									</tbody>
								</table>
							</div>
							<div class="bg-primary/5 p-4 rounded-lg my-4">
								<p class="font-semibold text-sm mb-2">💡 Tip:</p>
								<p class="text-sm text-muted-foreground">Mix techniques to suit topic, learners, and available resources.</p>
							</div>
						</div>
						<div class="space-y-6">
							<h2 class="text-2xl font-bold text-primary">8.3 Questioning Techniques</h2>
							<ul class="list-disc list-inside space-y-2 text-sm text-muted-foreground ml-4">
								<li>Use open-ended questions to encourage critical thinking</li>
								<li>Use wait time after asking questions to allow responses</li>
								<li>Encourage peer discussion before answering</li>
								<li>Check understanding with formative questions during lessons</li>
							</ul>
						</div>
						<div class="space-y-6">
							<h2 class="text-2xl font-bold text-primary">8.4 Adapting to Learning Styles</h2>
							<ul class="list-disc list-inside space-y-2 text-sm text-muted-foreground ml-4">
								<li><strong>Visual learners:</strong> Diagrams, charts, videos</li>
								<li><strong>Auditory learners:</strong> Lectures, discussions, podcasts</li>
								<li><strong>Kinesthetic learners:</strong> Experiments, role-play, hands-on activities</li>
								<li><strong>Reading/writing learners:</strong> Summaries, essays, research assignments</li>
							</ul>
							<div class="bg-primary/5 p-4 rounded-lg my-4">
								<p class="font-semibold text-sm mb-2">💡 Tip:</p>
								<p class="text-sm text-muted-foreground">Include multiple approaches in one lesson to reach all students.</p>
							</div>
						</div>
						<div class="space-y-6">
							<h2 class="text-2xl font-bold text-primary">8.5 Technology in Lesson Delivery</h2>
							<ul class="list-disc list-inside space-y-2 text-sm text-muted-foreground ml-4">
								<li>Use slides, simulations, videos, and interactive tools</li>
								<li>Engage students with digital quizzes or polls</li>
								<li>Ensure tech use supports, not distracts from, learning</li>
							</ul>
							<div class="bg-primary/5 p-4 rounded-lg my-4">
								<p class="font-semibold mb-2">Example Tools:</p>
								<ul class="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-4">
									<li>Kahoot for quizzes</li>
									<li>Google Slides for interactive presentations</li>
									<li>YouTube Education for educational videos</li>
								</ul>
							</div>
						</div>
						<div class="space-y-6">
							<h2 class="text-2xl font-bold text-primary">✅ Module 8 Summary</h2>
							<ul class="list-disc list-inside space-y-2 text-sm text-muted-foreground ml-4">
								<li>Effective lessons are clear, engaging, and purposeful</li>
								<li>Tutors should mix teaching techniques for diverse learners</li>
								<li>Questioning, demonstrations, and hands-on activities enhance learning</li>
								<li>Technology supports but does not replace good teaching practices</li>
								<li>Adapting to learning styles ensures all students are reached</li>
							</ul>
						</div>
					</div>`,
					videos: [
						{ youtubeUrl: '', caption: 'Effective Teaching Techniques' },
						{ youtubeUrl: '', caption: 'Lesson Delivery Strategies' },
					],
				},
				sections: [
					{
						id: 's8s1',
						title: '8.1 Principles of Effective Lesson Delivery',
						html: `<div class="space-y-4"><p class="text-muted-foreground">Be well-prepared, maintain clear objectives, speak clearly and confidently, engage students actively, and check for understanding regularly. Begin with a short activity connecting prior knowledge.</p></div>`,
						youtubeUrl: '',
						caption: 'Lesson Delivery Principles',
					},
					{
						id: 's8s2',
						title: '8.2 Teaching Techniques',
						html: `<div class="space-y-4"><p class="text-muted-foreground">Techniques include direct instruction, inquiry-based learning, demonstration, discussion, problem-solving, and collaborative learning. Mix techniques to suit topic, learners, and resources.</p></div>`,
						youtubeUrl: '',
						caption: 'Teaching Techniques',
					},
					{
						id: 's8s3',
						title: '8.3 Questioning Techniques',
						html: `<div class="space-y-4"><p class="text-muted-foreground">Use open-ended questions, wait time after asking, encourage peer discussion, and check understanding with formative questions during lessons.</p></div>`,
						youtubeUrl: '',
						caption: 'Questioning Techniques',
					},
					{
						id: 's8s4',
						title: '8.4 Adapting to Learning Styles',
						html: `<div class="space-y-4"><p class="text-muted-foreground">Visual (diagrams, charts, videos), Auditory (lectures, discussions), Kinesthetic (experiments, role-play), Reading/Writing (summaries, essays). Include multiple approaches in one lesson.</p></div>`,
						youtubeUrl: '',
						caption: 'Learning Styles',
					},
					{
						id: 's8s5',
						title: '8.5 Technology in Lesson Delivery',
						html: `<div class="space-y-4"><p class="text-muted-foreground">Use slides, simulations, videos, interactive tools, digital quizzes, and polls. Ensure tech supports, not distracts from, learning. Tools: Kahoot, Google Slides, YouTube Education.</p></div>`,
						youtubeUrl: '',
						caption: 'Technology in Delivery',
					},
				],
				quiz: [
					{
						question: 'Effective lesson delivery begins with:',
						options: ['Clear learning objectives', 'Reading the textbook silently', 'Random activities', 'Ignoring preparation'],
						correctAnswerIndex: 0,
					},
					{
						question: 'Inquiry-based learning encourages:',
						options: ['Memorization', 'Student exploration and questioning', 'Teacher monologue only', 'Copying notes'],
						correctAnswerIndex: 1,
					},
					{
						question: 'Demonstration is effective for:',
						options: ['Explaining abstract concepts', 'Ignoring hands-on tasks', 'Lecturing only', 'Silent reading'],
						correctAnswerIndex: 0,
					},
					{
						question: 'Open-ended questions:',
						options: ['Encourage critical thinking', 'Have only one answer', 'Limit discussion', 'Confuse students'],
						correctAnswerIndex: 0,
					},
					{
						question: 'Wait time after a question helps:',
						options: ['Students think and respond', 'Tutor continue talking', 'Reduce participation', 'Silence class permanently'],
						correctAnswerIndex: 0,
					},
					{
						question: 'Direct instruction is best for:',
						options: ['Step-by-step explanation', 'Only group work', 'Ignoring learning objectives', 'Random activities'],
						correctAnswerIndex: 0,
					},
					{
						question: 'Collaborative learning involves:',
						options: ['Peer interaction and group tasks', 'Silent individual work', 'Teacher-only instruction', 'No participation'],
						correctAnswerIndex: 0,
					},
					{
						question: 'Problem-solving activities:',
						options: ['Apply knowledge to real-life scenarios', 'Focus on memorization', 'Discourage critical thinking', 'Only exams'],
						correctAnswerIndex: 0,
					},
					{
						question: 'Visual learners benefit from:',
						options: ['Diagrams and videos', 'Lectures only', 'Role-play only', 'Oral instructions only'],
						correctAnswerIndex: 0,
					},
					{
						question: 'Kinesthetic learners learn best through:',
						options: ['Hands-on activities', 'Silent reading only', 'Listening only', 'Watching videos only'],
						correctAnswerIndex: 0,
					},
					{
						question: 'Technology in lesson delivery should:',
						options: ['Support learning', 'Distract students', 'Replace tutor completely', 'Be used randomly'],
						correctAnswerIndex: 0,
					},
					{
						question: 'Using multiple teaching techniques:',
						options: ['Addresses diverse learner needs', 'Confuses students', 'Wastes time', 'Is unnecessary'],
						correctAnswerIndex: 0,
					},
					{
						question: 'Formative questioning during lessons helps to:',
						options: ['Check understanding', 'Ignore learning gaps', 'Punish students', 'Only grade tests'],
						correctAnswerIndex: 0,
					},
					{
						question: 'A good discussion activity encourages:',
						options: ['Student participation', 'Only teacher talk', 'Silence', 'Memorization'],
						correctAnswerIndex: 0,
					},
					{
						question: 'Effective lesson delivery requires:',
						options: ['Preparation, engagement, and clarity', 'Random improvisation', 'Ignoring students', 'Only using technology'],
						correctAnswerIndex: 0,
					},
				],
			},
			{
				id: 's9',
				title: 'Assessment, Feedback & Student Progress Monitoring',
				description: 'Understand different types of assessment, apply formative, summative, diagnostic, and peer/self-assessment techniques, provide meaningful feedback, and track student progress effectively.',
				content: {
					html: `<div class="space-y-10">
						<div class="space-y-6">
							<h1 class="text-3xl font-bold text-primary mb-2">Module 9: Assessment, Feedback & Student Progress Monitoring</h1>
							<p class="text-muted-foreground mb-6">(Duration: ~60 minutes)</p>
							<div class="bg-primary/5 border-l-4 border-primary p-4 rounded-r-lg">
								<h3 class="font-bold text-lg mb-3 text-primary">🎯 Learning Objectives</h3>
								<p class="text-sm mb-2">By the end of this module, tutors will be able to:</p>
								<ul class="list-disc list-inside space-y-2 text-sm text-muted-foreground ml-4">
									<li>Understand different types of assessment and their purposes</li>
									<li>Apply formative, summative, diagnostic, and peer/self-assessment techniques</li>
									<li>Provide meaningful and constructive feedback</li>
									<li>Track and monitor student progress effectively</li>
									<li>Use assessment data to improve teaching and learning</li>
								</ul>
							</div>
						</div>
						<div class="space-y-6">
							<h2 class="text-2xl font-bold text-primary">9.1 Understanding Assessment</h2>
							<p class="text-muted-foreground">Assessment is a systematic process to evaluate student learning, understanding, and skills. It guides teaching and identifies areas for improvement.</p>
							<div class="bg-secondary/5 p-4 rounded-lg my-4">
								<h4 class="font-semibold mb-3">Purposes of Assessment:</h4>
								<ul class="list-disc list-inside space-y-2 text-sm text-muted-foreground ml-4">
									<li><strong>Inform teaching:</strong> Identify what students know and don't know</li>
									<li><strong>Measure achievement:</strong> Determine mastery of learning objectives</li>
									<li><strong>Provide feedback:</strong> Help students understand strengths and areas to improve</li>
									<li><strong>Guide curriculum planning:</strong> Adapt lessons based on student needs</li>
								</ul>
							</div>
							<div class="relative overflow-x-auto shadow-sm rounded-lg my-4">
								<table class="w-full text-sm">
									<thead class="bg-primary/5">
										<tr>
											<th class="px-4 py-3 text-left font-semibold">Type</th>
											<th class="px-4 py-3 text-left font-semibold">Purpose</th>
											<th class="px-4 py-3 text-left font-semibold">Example</th>
										</tr>
									</thead>
									<tbody>
										<tr class="border-b border-primary/10">
											<td class="px-4 py-3 font-medium">Formative</td>
											<td class="px-4 py-3">Monitor learning during lessons</td>
											<td class="px-4 py-3">Mini quizzes, class questioning, observation</td>
										</tr>
										<tr class="border-b border-primary/10">
											<td class="px-4 py-3 font-medium">Summative</td>
											<td class="px-4 py-3">Evaluate learning at the end of a unit or term</td>
											<td class="px-4 py-3">Exams, projects, end-of-term tests</td>
										</tr>
										<tr class="border-b border-primary/10">
											<td class="px-4 py-3 font-medium">Diagnostic</td>
											<td class="px-4 py-3">Identify prior knowledge and learning gaps</td>
											<td class="px-4 py-3">Pre-tests, baseline assessments</td>
										</tr>
										<tr class="border-b border-primary/10">
											<td class="px-4 py-3 font-medium">Peer/Self</td>
											<td class="px-4 py-3">Encourage reflection and collaboration</td>
											<td class="px-4 py-3">Peer review, self-evaluation checklists</td>
										</tr>
									</tbody>
								</table>
							</div>
						</div>
						<div class="space-y-6">
							<h2 class="text-2xl font-bold text-primary">9.2 Formative Assessment</h2>
							<ul class="list-disc list-inside space-y-2 text-sm text-muted-foreground ml-4">
								<li>Provides real-time insight into student understanding</li>
								<li>Can be informal (questions, thumbs up/down, exit tickets) or formal (short quizzes)</li>
								<li>Encourages student participation and reduces anxiety around testing</li>
							</ul>
							<div class="bg-primary/5 p-4 rounded-lg my-4">
								<p class="font-semibold mb-2">Example Activity:</p>
								<p class="text-sm text-muted-foreground">Ask students to summarize a concept in their own words after a lesson; correct misconceptions immediately.</p>
							</div>
						</div>
						<div class="space-y-6">
							<h2 class="text-2xl font-bold text-primary">9.3 Summative Assessment</h2>
							<ul class="list-disc list-inside space-y-2 text-sm text-muted-foreground ml-4">
								<li>Evaluates cumulative knowledge or skills</li>
								<li>Usually graded and used for reporting</li>
								<li>Helps determine whether learning objectives have been achieved</li>
							</ul>
							<div class="bg-primary/5 p-4 rounded-lg my-4">
								<p class="font-semibold mb-2">Example:</p>
								<p class="text-sm text-muted-foreground">A science project presented at the end of a term assessing understanding of concepts, creativity, and research skills.</p>
							</div>
						</div>
						<div class="space-y-6">
							<h2 class="text-2xl font-bold text-primary">9.4 Diagnostic Assessment</h2>
							<ul class="list-disc list-inside space-y-2 text-sm text-muted-foreground ml-4">
								<li>Conducted before teaching a new topic</li>
								<li>Identifies strengths, weaknesses, and gaps</li>
								<li>Informs lesson planning and differentiated instruction</li>
							</ul>
							<div class="bg-primary/5 p-4 rounded-lg my-4">
								<p class="font-semibold mb-2">Example:</p>
								<p class="text-sm text-muted-foreground">Pre-test on algebra before starting a new unit to adjust difficulty and pace.</p>
							</div>
						</div>
						<div class="space-y-6">
							<h2 class="text-2xl font-bold text-primary">9.5 Peer & Self-Assessment</h2>
							<ul class="list-disc list-inside space-y-2 text-sm text-muted-foreground ml-4">
								<li>Encourages reflection and critical thinking</li>
								<li>Promotes student accountability and engagement</li>
								<li>Helps students learn from one another</li>
							</ul>
							<div class="bg-primary/5 p-4 rounded-lg my-4">
								<p class="font-semibold mb-2">Example:</p>
								<p class="text-sm text-muted-foreground">Students exchange essays for peer review, giving feedback on clarity, structure, and argument quality.</p>
							</div>
						</div>
						<div class="space-y-6">
							<h2 class="text-2xl font-bold text-primary">9.6 Effective Feedback</h2>
							<ul class="list-disc list-inside space-y-2 text-sm text-muted-foreground ml-4">
								<li>Feedback should be specific, actionable, and timely</li>
								<li>Focus on strengths, areas for improvement, and next steps</li>
								<li>Use positive language to motivate learners</li>
							</ul>
							<div class="bg-primary/5 p-4 rounded-lg my-4">
								<p class="font-semibold mb-2">Example:</p>
								<p class="text-sm text-muted-foreground">"Your essay has strong arguments, but include more evidence to support your claims. Try adding one example from the textbook."</p>
							</div>
							<div class="bg-primary/5 p-4 rounded-lg my-4">
								<p class="font-semibold text-sm mb-2">💡 Tip:</p>
								<p class="text-sm text-muted-foreground">Combine written, verbal, and digital feedback for maximum impact.</p>
							</div>
						</div>
						<div class="space-y-6">
							<h2 class="text-2xl font-bold text-primary">9.7 Monitoring Student Progress</h2>
							<ul class="list-disc list-inside space-y-2 text-sm text-muted-foreground ml-4">
								<li>Track performance over time to identify trends</li>
								<li>Use mark books, spreadsheets, or digital platforms</li>
								<li>Monitor engagement, participation, and skill development</li>
								<li>Adapt teaching strategies based on insights</li>
							</ul>
							<div class="bg-primary/5 p-4 rounded-lg my-4">
								<p class="font-semibold mb-2">Example:</p>
								<p class="text-sm text-muted-foreground">Maintain a spreadsheet tracking quiz scores, homework completion, and participation to identify students needing extra support.</p>
							</div>
						</div>
						<div class="space-y-6">
							<h2 class="text-2xl font-bold text-primary">9.8 Practical Tips for Tutors</h2>
							<ul class="list-disc list-inside space-y-2 text-sm text-muted-foreground ml-4">
								<li>Use varied assessment methods to reach all learners</li>
								<li>Provide feedback quickly to reinforce learning</li>
								<li>Encourage students to set personal goals based on assessment results</li>
								<li>Avoid overemphasis on grades; focus on learning progress</li>
								<li>Involve students in reflecting on their performance</li>
							</ul>
						</div>
						<div class="space-y-6">
							<h2 class="text-2xl font-bold text-primary">✅ Module 9 Summary</h2>
							<ul class="list-disc list-inside space-y-2 text-sm text-muted-foreground ml-4">
								<li>Assessment types serve different purposes: formative, summative, diagnostic, peer/self</li>
								<li>Effective feedback is specific, actionable, and timely</li>
								<li>Monitoring progress helps identify trends and adapt teaching</li>
								<li>Varied assessment methods reach all learners</li>
								<li>Assessment data should inform teaching and learning improvements</li>
							</ul>
						</div>
					</div>`,
					videos: [
						{ youtubeUrl: '', caption: 'Assessment Strategies' },
						{ youtubeUrl: '', caption: 'Effective Feedback Techniques' },
					],
				},
				sections: [
					{
						id: 's9s1',
						title: '9.1 Understanding Assessment',
						html: `<div class="space-y-4"><p class="text-muted-foreground">Assessment evaluates learning and guides teaching. Purposes: inform teaching, measure achievement, provide feedback, guide curriculum planning. Types: formative (during lessons), summative (end of unit/term), diagnostic (identify gaps), peer/self (encourage reflection).</p></div>`,
						youtubeUrl: '',
						caption: 'Understanding Assessment',
					},
					{
						id: 's9s2',
						title: '9.2 Formative Assessment',
						html: `<div class="space-y-4"><p class="text-muted-foreground">Provides real-time insight into understanding. Can be informal (questions, thumbs up/down, exit tickets) or formal (short quizzes). Encourages participation and reduces anxiety. Example: Ask students to summarize a concept in their own words.</p></div>`,
						youtubeUrl: '',
						caption: 'Formative Assessment',
					},
					{
						id: 's9s3',
						title: '9.3 Summative Assessment',
						html: `<div class="space-y-4"><p class="text-muted-foreground">Evaluates cumulative knowledge or skills. Usually graded and used for reporting. Helps determine whether learning objectives have been achieved. Example: Science project at end of term.</p></div>`,
						youtubeUrl: '',
						caption: 'Summative Assessment',
					},
					{
						id: 's9s4',
						title: '9.4 Diagnostic Assessment',
						html: `<div class="space-y-4"><p class="text-muted-foreground">Conducted before teaching a new topic. Identifies strengths, weaknesses, and gaps. Informs lesson planning and differentiated instruction. Example: Pre-test on algebra before starting new unit.</p></div>`,
						youtubeUrl: '',
						caption: 'Diagnostic Assessment',
					},
					{
						id: 's9s5',
						title: '9.5 Peer & Self-Assessment',
						html: `<div class="space-y-4"><p class="text-muted-foreground">Encourages reflection and critical thinking, promotes accountability and engagement, helps students learn from one another. Example: Students exchange essays for peer review.</p></div>`,
						youtubeUrl: '',
						caption: 'Peer & Self-Assessment',
					},
					{
						id: 's9s6',
						title: '9.6 Effective Feedback',
						html: `<div class="space-y-4"><p class="text-muted-foreground">Should be specific, actionable, and timely. Focus on strengths, areas for improvement, and next steps. Use positive language. Combine written, verbal, and digital feedback.</p></div>`,
						youtubeUrl: '',
						caption: 'Effective Feedback',
					},
					{
						id: 's9s7',
						title: '9.7 Monitoring Student Progress',
						html: `<div class="space-y-4"><p class="text-muted-foreground">Track performance over time, use mark books or digital platforms, monitor engagement and participation, adapt teaching strategies. Example: Spreadsheet tracking quiz scores and homework completion.</p></div>`,
						youtubeUrl: '',
						caption: 'Progress Monitoring',
					},
				],
				quiz: [
					{
						question: 'Assessment helps tutors to:',
						options: ['Punish students', 'Identify learning gaps', 'Ignore progress', 'Only grade exams'],
						correctAnswerIndex: 1,
					},
					{
						question: 'Formative assessment is used:',
						options: ['During lessons', 'At the end of the term', 'Before the school year', 'Only for grading'],
						correctAnswerIndex: 0,
					},
					{
						question: 'Summative assessment evaluates:',
						options: ['Real-time understanding', 'Cumulative learning', 'Prior knowledge only', 'Peer behavior'],
						correctAnswerIndex: 1,
					},
					{
						question: 'Diagnostic assessment is conducted:',
						options: ['After a lesson', 'Before teaching a new topic', 'At the end of term', 'Randomly'],
						correctAnswerIndex: 1,
					},
					{
						question: 'Peer assessment encourages:',
						options: ['Reflection and collaboration', 'Cheating', 'Laziness', 'Ignoring instructions'],
						correctAnswerIndex: 0,
					},
					{
						question: 'Effective feedback should be:',
						options: ['Specific and actionable', 'Vague', 'Negative only', 'Delayed indefinitely'],
						correctAnswerIndex: 0,
					},
					{
						question: 'Self-assessment helps students to:',
						options: ['Reflect on their learning', 'Copy peers', 'Ignore progress', 'Avoid responsibility'],
						correctAnswerIndex: 0,
					},
					{
						question: 'Monitoring student progress involves:',
						options: ['Tracking performance over time', 'Ignoring trends', 'Only grading tests', 'Punishing low scores'],
						correctAnswerIndex: 0,
					},
					{
						question: 'Exit tickets are a form of:',
						options: ['Summative assessment', 'Formative assessment', 'Diagnostic test', 'Peer review'],
						correctAnswerIndex: 1,
					},
					{
						question: 'Feedback should focus on:',
						options: ['Strengths and improvement steps', 'Only mistakes', 'Punishment', 'Ignoring effort'],
						correctAnswerIndex: 0,
					},
					{
						question: 'A pre-test in algebra is an example of:',
						options: ['Formative assessment', 'Diagnostic assessment', 'Summative assessment', 'Peer assessment'],
						correctAnswerIndex: 1,
					},
					{
						question: 'Using digital tools to track progress can:',
						options: ['Help identify students needing support', 'Replace teaching completely', 'Distract students', 'Only grade exams'],
						correctAnswerIndex: 0,
					},
					{
						question: 'Combining verbal, written, and digital feedback:',
						options: ['Reinforces learning', 'Confuses students', 'Is unnecessary', 'Discourages learners'],
						correctAnswerIndex: 0,
					},
					{
						question: 'Assessment data helps tutors to:',
						options: ['Adjust teaching strategies', 'Ignore weak students', 'Punish learners', 'Focus only on strong students'],
						correctAnswerIndex: 0,
					},
					{
						question: 'The main purpose of assessment is:',
						options: ['Support learning and improvement', 'Only assign grades', 'Create competition', 'Only punish mistakes'],
						correctAnswerIndex: 0,
					},
				],
			},
			{
				id: 's10',
				title: 'Classroom Technology Integration & Digital Tools',
				description: 'Identify technology tools suitable for secondary education, integrate digital tools into lesson delivery, use technology to enhance engagement and assessment, and promote responsible digital practices.',
				content: {
					html: `<div class="space-y-10">
						<div class="space-y-6">
							<h1 class="text-3xl font-bold text-primary mb-2">Module 10: Classroom Technology Integration & Digital Tools</h1>
							<p class="text-muted-foreground mb-6">(Duration: ~60 minutes)</p>
							<div class="bg-primary/5 border-l-4 border-primary p-4 rounded-r-lg">
								<h3 class="font-bold text-lg mb-3 text-primary">🎯 Learning Objectives</h3>
								<p class="text-sm mb-2">By the end of this module, tutors will be able to:</p>
								<ul class="list-disc list-inside space-y-2 text-sm text-muted-foreground ml-4">
									<li>Identify technology tools suitable for secondary education</li>
									<li>Integrate digital tools into lesson delivery effectively</li>
									<li>Use technology to enhance engagement, collaboration, and assessment</li>
									<li>Promote responsible and safe digital practices</li>
									<li>Adapt technology for diverse learning needs</li>
								</ul>
							</div>
						</div>
						<div class="space-y-6">
							<h2 class="text-2xl font-bold text-primary">10.1 Importance of Technology in the Classroom</h2>
							<ul class="list-disc list-inside space-y-2 text-sm text-muted-foreground ml-4">
								<li>Makes lessons interactive, engaging, and visual</li>
								<li>Supports different learning styles (visual, auditory, kinesthetic)</li>
								<li>Enables real-time feedback and assessment</li>
								<li>Encourages collaboration and creativity</li>
								<li>Prepares students for digital literacy and future careers</li>
							</ul>
							<div class="bg-primary/5 p-4 rounded-lg my-4">
								<p class="font-semibold mb-2">Example:</p>
								<p class="text-sm text-muted-foreground">Using an interactive simulation in Physics to demonstrate forces and motion allows students to visualize concepts rather than only reading about them.</p>
							</div>
						</div>
						<div class="space-y-6">
							<h2 class="text-2xl font-bold text-primary">10.2 Types of Digital Tools</h2>
							<div class="relative overflow-x-auto shadow-sm rounded-lg my-4">
								<table class="w-full text-sm">
									<thead class="bg-primary/5">
										<tr>
											<th class="px-4 py-3 text-left font-semibold">Tool Type</th>
											<th class="px-4 py-3 text-left font-semibold">Use in Class</th>
											<th class="px-4 py-3 text-left font-semibold">Example</th>
										</tr>
									</thead>
									<tbody>
										<tr class="border-b border-primary/10">
											<td class="px-4 py-3 font-medium">Presentation tools</td>
											<td class="px-4 py-3">Visual explanations, summaries</td>
											<td class="px-4 py-3">Google Slides, PowerPoint</td>
										</tr>
										<tr class="border-b border-primary/10">
											<td class="px-4 py-3 font-medium">Collaboration tools</td>
											<td class="px-4 py-3">Group work and sharing ideas</td>
											<td class="px-4 py-3">Google Docs, Padlet</td>
										</tr>
										<tr class="border-b border-primary/10">
											<td class="px-4 py-3 font-medium">Assessment tools</td>
											<td class="px-4 py-3">Quizzes and instant feedback</td>
											<td class="px-4 py-3">Kahoot, Quizizz</td>
										</tr>
										<tr class="border-b border-primary/10">
											<td class="px-4 py-3 font-medium">Interactive simulations</td>
											<td class="px-4 py-3">Experiments or concepts</td>
											<td class="px-4 py-3">PhET, Gizmos</td>
										</tr>
										<tr class="border-b border-primary/10">
											<td class="px-4 py-3 font-medium">Digital storytelling</td>
											<td class="px-4 py-3">Creative projects</td>
											<td class="px-4 py-3">StoryJumper, Book Creator</td>
										</tr>
										<tr class="border-b border-primary/10">
											<td class="px-4 py-3 font-medium">Learning management systems</td>
											<td class="px-4 py-3">Assignments, grades, communication</td>
											<td class="px-4 py-3">Google Classroom, Edmodo</td>
										</tr>
									</tbody>
								</table>
							</div>
						</div>
						<div class="space-y-6">
							<h2 class="text-2xl font-bold text-primary">10.3 Strategies for Technology Integration</h2>
							<ul class="list-disc list-inside space-y-2 text-sm text-muted-foreground ml-4">
								<li>Blend with traditional teaching: Use digital tools to support—not replace—direct instruction</li>
								<li>Plan tech use in advance: Ensure activities align with learning objectives</li>
								<li>Monitor and guide usage: Keep students focused and safe</li>
								<li>Encourage collaboration: Use digital tools for group projects and discussions</li>
								<li>Differentiate learning: Offer adaptive resources for diverse learners</li>
							</ul>
							<div class="bg-primary/5 p-4 rounded-lg my-4">
								<p class="font-semibold mb-2">Example:</p>
								<p class="text-sm text-muted-foreground">Students create a collaborative presentation on climate change using Google Slides, combining research, images, and data charts.</p>
							</div>
						</div>
						<div class="space-y-6">
							<h2 class="text-2xl font-bold text-primary">10.4 Digital Citizenship & Safety</h2>
							<ul class="list-disc list-inside space-y-2 text-sm text-muted-foreground ml-4">
								<li>Teach responsible online behavior</li>
								<li>Emphasize privacy, respectful communication, and avoiding plagiarism</li>
								<li>Monitor social media, apps, and internet use in class</li>
								<li>Model ethical use of technology</li>
							</ul>
						</div>
						<div class="space-y-6">
							<h2 class="text-2xl font-bold text-primary">10.5 Technology for Assessment & Feedback</h2>
							<ul class="list-disc list-inside space-y-2 text-sm text-muted-foreground ml-4">
								<li>Use online quizzes, polls, and interactive forms for immediate feedback</li>
								<li>Track performance using LMS dashboards</li>
								<li>Incorporate peer feedback through collaborative platforms</li>
							</ul>
							<div class="bg-primary/5 p-4 rounded-lg my-4">
								<p class="font-semibold mb-2">Example:</p>
								<p class="text-sm text-muted-foreground">A Kahoot quiz at the end of a lesson provides instant feedback and identifies areas needing revision.</p>
							</div>
						</div>
						<div class="space-y-6">
							<h2 class="text-2xl font-bold text-primary">10.6 Practical Tips for Tutors</h2>
							<ul class="list-disc list-inside space-y-2 text-sm text-muted-foreground ml-4">
								<li>Always test tools before class to avoid technical issues</li>
								<li>Combine visual, auditory, and interactive elements</li>
								<li>Limit screen time; keep lessons balanced</li>
								<li>Encourage students to use tech creatively for research and projects</li>
								<li>Provide guidance on credible sources</li>
							</ul>
						</div>
						<div class="space-y-6">
							<h2 class="text-2xl font-bold text-primary">✅ Module 10 Summary</h2>
							<ul class="list-disc list-inside space-y-2 text-sm text-muted-foreground ml-4">
								<li>Technology enhances engagement, collaboration, and learning when integrated thoughtfully</li>
								<li>Tutors should plan, monitor, and balance tech use with traditional methods</li>
								<li>Digital tools can support assessment, feedback, and differentiated learning</li>
								<li>Responsible digital behavior and safety are essential</li>
								<li>Proper use of technology prepares students for 21st-century learning</li>
							</ul>
						</div>
					</div>`,
					videos: [
						{ youtubeUrl: '', caption: 'Technology Integration in Education' },
						{ youtubeUrl: '', caption: 'Digital Tools for Teaching' },
					],
				},
				sections: [
					{
						id: 's10s1',
						title: '10.1 Importance of Technology in the Classroom',
						html: `<div class="space-y-4"><p class="text-muted-foreground">Technology makes lessons interactive, supports different learning styles, enables real-time feedback, encourages collaboration, and prepares students for digital literacy. Example: Interactive simulations visualize concepts.</p></div>`,
						youtubeUrl: '',
						caption: 'Technology in Classroom',
					},
					{
						id: 's10s2',
						title: '10.2 Types of Digital Tools',
						html: `<div class="space-y-4"><p class="text-muted-foreground">Tools include presentation (Google Slides, PowerPoint), collaboration (Google Docs, Padlet), assessment (Kahoot, Quizizz), simulations (PhET, Gizmos), storytelling (StoryJumper), and LMS (Google Classroom, Edmodo).</p></div>`,
						youtubeUrl: '',
						caption: 'Digital Tools',
					},
					{
						id: 's10s3',
						title: '10.3 Strategies for Technology Integration',
						html: `<div class="space-y-4"><p class="text-muted-foreground">Blend with traditional teaching, plan tech use in advance, monitor and guide usage, encourage collaboration, and differentiate learning. Example: Collaborative presentation on climate change using Google Slides.</p></div>`,
						youtubeUrl: '',
						caption: 'Integration Strategies',
					},
					{
						id: 's10s4',
						title: '10.4 Digital Citizenship & Safety',
						html: `<div class="space-y-4"><p class="text-muted-foreground">Teach responsible online behavior, emphasize privacy and respectful communication, avoid plagiarism, monitor internet use, and model ethical use of technology.</p></div>`,
						youtubeUrl: '',
						caption: 'Digital Citizenship',
					},
					{
						id: 's10s5',
						title: '10.5 Technology for Assessment & Feedback',
						html: `<div class="space-y-4"><p class="text-muted-foreground">Use online quizzes, polls, and interactive forms for immediate feedback. Track performance using LMS dashboards. Incorporate peer feedback through collaborative platforms. Example: Kahoot quiz provides instant feedback.</p></div>`,
						youtubeUrl: '',
						caption: 'Tech for Assessment',
					},
				],
				quiz: [
					{
						question: 'Technology in the classroom helps to:',
						options: ['Replace all teaching', 'Enhance engagement and learning', 'Distract students', 'Increase homework only'],
						correctAnswerIndex: 1,
					},
					{
						question: 'Presentation tools like Google Slides are used for:',
						options: ['Quizzes', 'Visual explanations and summaries', 'Peer grading only', 'Ignoring lessons'],
						correctAnswerIndex: 1,
					},
					{
						question: 'Collaboration tools allow students to:',
						options: ['Work together and share ideas', 'Work individually only', 'Avoid tasks', 'Watch videos passively'],
						correctAnswerIndex: 0,
					},
					{
						question: 'Assessment tools such as Kahoot and Quizizz are used for:',
						options: ['Instant feedback and quizzes', 'Only attendance', 'Only grading exams', 'Only lectures'],
						correctAnswerIndex: 0,
					},
					{
						question: 'Digital storytelling tools help students to:',
						options: ['Create creative projects', 'Play games only', 'Read textbooks', 'Ignore lessons'],
						correctAnswerIndex: 0,
					},
					{
						question: 'Learning management systems like Google Classroom help to:',
						options: ['Assign work, communicate, and track grades', 'Replace the teacher', 'Distract students', 'Only show videos'],
						correctAnswerIndex: 0,
					},
					{
						question: 'Blending technology with traditional teaching means:',
						options: ['Replacing teachers completely', 'Supporting direct instruction', 'Ignoring lesson objectives', 'Using games only'],
						correctAnswerIndex: 1,
					},
					{
						question: 'Digital citizenship includes:',
						options: ['Respectful online behavior', 'Copying content', 'Sharing passwords', 'Ignoring rules'],
						correctAnswerIndex: 0,
					},
					{
						question: 'Tutors should:',
						options: ['Monitor tech use in class', 'Let students use tech without supervision', 'Ignore distractions', 'Avoid teaching digital safety'],
						correctAnswerIndex: 0,
					},
					{
						question: 'Interactive simulations are best for:',
						options: ['Visualizing abstract concepts', 'Watching videos only', 'Silent reading', 'Memorization'],
						correctAnswerIndex: 0,
					},
					{
						question: 'Technology can help differentiated learning by:',
						options: ['Providing adaptive resources', 'Giving same tasks to all', 'Ignoring learning needs', 'Punishing students'],
						correctAnswerIndex: 0,
					},
					{
						question: 'A Kahoot quiz provides:',
						options: ['Delayed feedback', 'Immediate feedback', 'Only grades', 'Only memorization'],
						correctAnswerIndex: 1,
					},
					{
						question: 'Tutors should always:',
						options: ['Test tools before class', 'Use any app randomly', 'Ignore technical issues', 'Avoid preparation'],
						correctAnswerIndex: 0,
					},
					{
						question: 'Limiting screen time ensures:',
						options: ['Balanced learning', 'Less engagement', 'Boredom', 'No learning'],
						correctAnswerIndex: 0,
					},
					{
						question: 'Teaching students to evaluate online sources promotes:',
						options: ['Critical thinking', 'Copying', 'Ignoring tasks', 'Laziness'],
						correctAnswerIndex: 0,
					},
				],
			},
			{
				id: 's11',
				title: 'Student Wellbeing, Mental Health & Motivation',
				description: 'Recognize the importance of student wellbeing, identify common mental health challenges, apply strategies to promote positive mental health, and support students in developing social and emotional skills.',
				content: {
					html: `<div class="space-y-10">
						<div class="space-y-6">
							<h1 class="text-3xl font-bold text-primary mb-2">Module 11: Student Wellbeing, Mental Health & Motivation</h1>
							<p class="text-muted-foreground mb-6">(Duration: ~60 minutes)</p>
							<div class="bg-primary/5 border-l-4 border-primary p-4 rounded-r-lg">
								<h3 class="font-bold text-lg mb-3 text-primary">🎯 Learning Objectives</h3>
								<p class="text-sm mb-2">By the end of this module, tutors will be able to:</p>
								<ul class="list-disc list-inside space-y-2 text-sm text-muted-foreground ml-4">
									<li>Recognize the importance of student wellbeing in learning</li>
									<li>Identify common mental health challenges among secondary learners</li>
									<li>Apply strategies to promote positive mental health</li>
									<li>Encourage motivation, resilience, and self-esteem</li>
									<li>Support students in developing social and emotional skills</li>
								</ul>
							</div>
						</div>
						<div class="space-y-6">
							<h2 class="text-2xl font-bold text-primary">11.1 Importance of Student Wellbeing</h2>
							<ul class="list-disc list-inside space-y-2 text-sm text-muted-foreground ml-4">
								<li>Student wellbeing directly affects academic performance, engagement, and behavior</li>
								<li>Promotes healthy relationships, emotional regulation, and social skills</li>
								<li>Encourages resilience, confidence, and self-awareness</li>
							</ul>
							<div class="bg-primary/5 p-4 rounded-lg my-4">
								<p class="font-semibold mb-2">Example:</p>
								<p class="text-sm text-muted-foreground">A student who feels supported is more likely to participate actively in class.</p>
							</div>
						</div>
						<div class="space-y-6">
							<h2 class="text-2xl font-bold text-primary">11.2 Common Mental Health Challenges</h2>
							<ul class="list-disc list-inside space-y-2 text-sm text-muted-foreground ml-4">
								<li>Anxiety and stress related to exams or peer pressure</li>
								<li>Low self-esteem or confidence issues</li>
								<li>Social isolation or bullying</li>
								<li>Depression or mood swings</li>
								<li>Attention difficulties (ADHD, learning challenges)</li>
							</ul>
							<div class="bg-primary/5 p-4 rounded-lg my-4">
								<p class="font-semibold text-sm mb-2">💡 Tip:</p>
								<p class="text-sm text-muted-foreground">Early recognition and referral are key; always communicate with school counselors or parents when needed.</p>
							</div>
						</div>
						<div class="space-y-6">
							<h2 class="text-2xl font-bold text-primary">11.3 Strategies to Promote Wellbeing</h2>
							<div class="relative overflow-x-auto shadow-sm rounded-lg my-4">
								<table class="w-full text-sm">
									<thead class="bg-primary/5">
										<tr>
											<th class="px-4 py-3 text-left font-semibold">Strategy</th>
											<th class="px-4 py-3 text-left font-semibold">Description</th>
											<th class="px-4 py-3 text-left font-semibold">Example</th>
										</tr>
									</thead>
									<tbody>
										<tr class="border-b border-primary/10">
											<td class="px-4 py-3 font-medium">Social-emotional learning (SEL)</td>
											<td class="px-4 py-3">Teach self-awareness, empathy, and relationship skills</td>
											<td class="px-4 py-3">Class discussion on managing anger</td>
										</tr>
										<tr class="border-b border-primary/10">
											<td class="px-4 py-3 font-medium">Mindfulness & relaxation</td>
											<td class="px-4 py-3">Reduce stress and improve focus</td>
											<td class="px-4 py-3">Short breathing exercises before exams</td>
										</tr>
										<tr class="border-b border-primary/10">
											<td class="px-4 py-3 font-medium">Positive reinforcement</td>
											<td class="px-4 py-3">Encourage achievements and effort</td>
											<td class="px-4 py-3">Praise consistent participation or effort</td>
										</tr>
										<tr class="border-b border-primary/10">
											<td class="px-4 py-3 font-medium">Safe and inclusive environment</td>
											<td class="px-4 py-3">Foster belonging and respect</td>
											<td class="px-4 py-3">Anti-bullying policies, mixed-ability group work</td>
										</tr>
										<tr class="border-b border-primary/10">
											<td class="px-4 py-3 font-medium">Goal setting</td>
											<td class="px-4 py-3">Build motivation and self-confidence</td>
											<td class="px-4 py-3">Students set personal learning goals</td>
										</tr>
									</tbody>
								</table>
							</div>
						</div>
						<div class="space-y-6">
							<h2 class="text-2xl font-bold text-primary">11.4 Motivation & Engagement</h2>
							<ul class="list-disc list-inside space-y-2 text-sm text-muted-foreground ml-4">
								<li><strong>Intrinsic motivation:</strong> Encourage learning for personal satisfaction and growth</li>
								<li><strong>Extrinsic motivation:</strong> Use rewards, recognition, and feedback to support learning</li>
								<li>Promote student autonomy and choice in projects and activities</li>
								<li>Connect learning to real-life contexts to maintain interest</li>
							</ul>
							<div class="bg-primary/5 p-4 rounded-lg my-4">
								<p class="font-semibold mb-2">Example:</p>
								<p class="text-sm text-muted-foreground">Let students choose topics for a science project based on personal interests to increase engagement.</p>
							</div>
						</div>
						<div class="space-y-6">
							<h2 class="text-2xl font-bold text-primary">11.5 Supporting Mental Health</h2>
							<ul class="list-disc list-inside space-y-2 text-sm text-muted-foreground ml-4">
								<li>Listen actively and empathetically to students' concerns</li>
								<li>Encourage open dialogue and peer support</li>
								<li>Provide resources or refer to counselors when needed</li>
								<li>Monitor signs of stress, anxiety, or depression</li>
								<li>Include activities that promote relaxation, teamwork, and emotional awareness</li>
							</ul>
							<div class="bg-primary/5 p-4 rounded-lg my-4">
								<p class="font-semibold mb-2">Example:</p>
								<p class="text-sm text-muted-foreground">Implement a "Wellbeing Corner" in the classroom with calming activities, journals, or quiet reflection.</p>
							</div>
						</div>
						<div class="space-y-6">
							<h2 class="text-2xl font-bold text-primary">11.6 Practical Tips for Tutors</h2>
							<ul class="list-disc list-inside space-y-2 text-sm text-muted-foreground ml-4">
								<li>Schedule regular breaks and active exercises in lessons</li>
								<li>Include collaborative and inclusive activities</li>
								<li>Encourage reflection and journaling for self-awareness</li>
								<li>Celebrate student achievements, big or small</li>
								<li>Be approachable and responsive to students' emotional needs</li>
							</ul>
						</div>
						<div class="space-y-6">
							<h2 class="text-2xl font-bold text-primary">✅ Module 11 Summary</h2>
							<ul class="list-disc list-inside space-y-2 text-sm text-muted-foreground ml-4">
								<li>Student wellbeing directly affects academic performance and engagement</li>
								<li>Common challenges include anxiety, low self-esteem, isolation, and attention difficulties</li>
								<li>Strategies include SEL, mindfulness, positive reinforcement, and safe environments</li>
								<li>Supporting mental health requires active listening, open dialogue, and early referral</li>
								<li>Tutors play a crucial role in promoting student wellbeing and motivation</li>
							</ul>
						</div>
					</div>`,
					videos: [
						{ youtubeUrl: '', caption: 'Student Wellbeing in Education' },
						{ youtubeUrl: '', caption: 'Mental Health Support Strategies' },
					],
				},
				sections: [
					{
						id: 's11s1',
						title: '11.1 Importance of Student Wellbeing',
						html: `<div class="space-y-4"><p class="text-muted-foreground">Student wellbeing directly affects academic performance, engagement, and behavior. It promotes healthy relationships, emotional regulation, social skills, resilience, confidence, and self-awareness. Example: Supported students participate more actively.</p></div>`,
						youtubeUrl: '',
						caption: 'Student Wellbeing',
					},
					{
						id: 's11s2',
						title: '11.2 Common Mental Health Challenges',
						html: `<div class="space-y-4"><p class="text-muted-foreground">Challenges include anxiety and stress (exams, peer pressure), low self-esteem, social isolation or bullying, depression or mood swings, and attention difficulties (ADHD). Early recognition and referral are key.</p></div>`,
						youtubeUrl: '',
						caption: 'Mental Health Challenges',
					},
					{
						id: 's11s3',
						title: '11.3 Strategies to Promote Wellbeing',
						html: `<div class="space-y-4"><p class="text-muted-foreground">Strategies include social-emotional learning (SEL), mindfulness and relaxation, positive reinforcement, safe and inclusive environments, and goal setting. Example: Class discussion on managing anger, breathing exercises before exams.</p></div>`,
						youtubeUrl: '',
						caption: 'Promoting Wellbeing',
					},
					{
						id: 's11s4',
						title: '11.4 Motivation & Engagement',
						html: `<div class="space-y-4"><p class="text-muted-foreground">Encourage intrinsic motivation (personal satisfaction) and extrinsic motivation (rewards, recognition). Promote student autonomy and choice. Connect learning to real-life contexts. Example: Students choose science project topics based on interests.</p></div>`,
						youtubeUrl: '',
						caption: 'Motivation & Engagement',
					},
					{
						id: 's11s5',
						title: '11.5 Supporting Mental Health',
						html: `<div class="space-y-4"><p class="text-muted-foreground">Listen actively and empathetically, encourage open dialogue and peer support, provide resources or refer to counselors, monitor signs of stress/anxiety/depression, include activities promoting relaxation and emotional awareness. Example: "Wellbeing Corner" with calming activities.</p></div>`,
						youtubeUrl: '',
						caption: 'Supporting Mental Health',
					},
				],
				quiz: [
					{
						question: 'Student wellbeing affects:',
						options: ['Only grades', 'Academic performance, engagement, and behavior', 'Nothing', 'Only attendance'],
						correctAnswerIndex: 1,
					},
					{
						question: 'Common mental health challenges in teens include:',
						options: ['Anxiety and stress', 'Only physical illness', 'No challenges', 'Memorization issues only'],
						correctAnswerIndex: 0,
					},
					{
						question: 'Social-emotional learning teaches:',
						options: ['Self-awareness and empathy', 'Only math', 'Only exam techniques', 'Memorization skills'],
						correctAnswerIndex: 0,
					},
					{
						question: 'Mindfulness in class helps:',
						options: ['Reduce stress and improve focus', 'Increase distraction', 'Punish students', 'Ignore learning'],
						correctAnswerIndex: 0,
					},
					{
						question: 'Positive reinforcement encourages:',
						options: ['Achievements and effort', 'Misbehavior', 'Laziness', 'Only grades'],
						correctAnswerIndex: 0,
					},
					{
						question: 'A safe and inclusive environment promotes:',
						options: ['Belonging and respect', 'Competition only', 'Bullying', 'Isolation'],
						correctAnswerIndex: 0,
					},
					{
						question: 'Goal setting helps students to:',
						options: ['Build motivation and confidence', 'Ignore learning', 'Focus only on grades', 'Avoid participation'],
						correctAnswerIndex: 0,
					},
					{
						question: 'Intrinsic motivation comes from:',
						options: ['Personal satisfaction', 'Rewards only', 'Fear', 'Peer pressure'],
						correctAnswerIndex: 0,
					},
					{
						question: 'Extrinsic motivation includes:',
						options: ['Praise and recognition', 'Curiosity', 'Self-reflection only', 'Journaling'],
						correctAnswerIndex: 0,
					},
					{
						question: 'Tutors support mental health by:',
						options: ['Listening empathetically', 'Ignoring concerns', 'Punishing students', 'Only grading tests'],
						correctAnswerIndex: 0,
					},
					{
						question: 'Encouraging peer support helps:',
						options: ['Build social skills and emotional resilience', 'Create conflict', 'Reduce engagement', 'Ignore students'],
						correctAnswerIndex: 0,
					},
					{
						question: 'Mindful breathing exercises are used to:',
						options: ['Reduce stress', 'Punish students', 'Only teach discipline', 'Replace learning'],
						correctAnswerIndex: 0,
					},
					{
						question: 'Celebrating student achievements promotes:',
						options: ['Motivation and confidence', 'Laziness', 'Stress', 'Isolation'],
						correctAnswerIndex: 0,
					},
					{
						question: 'Reflection activities in class help:',
						options: ['Build self-awareness', 'Distract learners', 'Only test memory', 'Reduce participation'],
						correctAnswerIndex: 0,
					},
					{
						question: 'The main goal of promoting wellbeing in students is:',
						options: ['Support learning, mental health, and engagement', 'Only assign grades', 'Punish misbehavior', 'Ignore emotional needs'],
						correctAnswerIndex: 0,
					},
				],
			},
			{
				id: 's12',
				title: 'Digital Teaching, Coding Basics & Child Online Safety',
				description: 'Introduce basic ICT skills and coding to secondary students, integrate digital tools safely, promote responsible online behavior, identify and prevent cyberbullying, and support digital learning.',
				content: {
					html: `<div class="space-y-10">
						<div class="space-y-6">
							<h1 class="text-3xl font-bold text-primary mb-2">Module 12: Digital Teaching, Coding Basics & Child Online Safety</h1>
							<p class="text-muted-foreground mb-6">(Duration: ~90 minutes)</p>
							<div class="bg-primary/5 border-l-4 border-primary p-4 rounded-r-lg">
								<h3 class="font-bold text-lg mb-3 text-primary">🎯 Learning Objectives</h3>
								<p class="text-sm mb-2">By the end of this module, tutors will be able to:</p>
								<ul class="list-disc list-inside space-y-2 text-sm text-muted-foreground ml-4">
									<li>Introduce basic ICT skills and coding to secondary students</li>
									<li>Integrate digital tools safely and effectively in lessons</li>
									<li>Promote responsible online behavior and digital citizenship</li>
									<li>Identify and prevent cyberbullying</li>
									<li>Support digital learning at school and at home</li>
								</ul>
							</div>
						</div>
						<div class="space-y-6">
							<h2 class="text-2xl font-bold text-primary">12.1 Importance of Digital Education</h2>
							<ul class="list-disc list-inside space-y-2 text-sm text-muted-foreground ml-4">
								<li>Enhances engagement, creativity, and problem-solving</li>
								<li>Prepares students for 21st-century skills and digital literacy</li>
								<li>Encourages collaboration, research, and self-directed learning</li>
							</ul>
							<div class="bg-primary/5 p-4 rounded-lg my-4">
								<p class="font-semibold mb-2">Example:</p>
								<p class="text-sm text-muted-foreground">Using an interactive coding app to create a simple animation develops logic, sequencing, and creativity.</p>
							</div>
						</div>
						<div class="space-y-6">
							<h2 class="text-2xl font-bold text-primary">12.2 Basic ICT Skills for Secondary Students</h2>
							<div class="relative overflow-x-auto shadow-sm rounded-lg my-4">
								<table class="w-full text-sm">
									<thead class="bg-primary/5">
										<tr>
											<th class="px-4 py-3 text-left font-semibold">Area</th>
											<th class="px-4 py-3 text-left font-semibold">Skills</th>
											<th class="px-4 py-3 text-left font-semibold">Example</th>
										</tr>
									</thead>
									<tbody>
										<tr class="border-b border-primary/10">
											<td class="px-4 py-3 font-medium">Device handling</td>
											<td class="px-4 py-3">Use laptop, tablet, keyboard, mouse</td>
											<td class="px-4 py-3">Open apps, create files</td>
										</tr>
										<tr class="border-b border-primary/10">
											<td class="px-4 py-3 font-medium">Internet navigation</td>
											<td class="px-4 py-3">Safe browsing, research</td>
											<td class="px-4 py-3">Use Google Scholar for assignments</td>
										</tr>
										<tr class="border-b border-primary/10">
											<td class="px-4 py-3 font-medium">Typing & text processing</td>
											<td class="px-4 py-3">Create documents, format text</td>
											<td class="px-4 py-3">Word, Google Docs</td>
										</tr>
										<tr class="border-b border-primary/10">
											<td class="px-4 py-3 font-medium">Digital creativity</td>
											<td class="px-4 py-3">Storytelling, multimedia projects</td>
											<td class="px-4 py-3">PowerPoint, Canva</td>
										</tr>
										<tr class="border-b border-primary/10">
											<td class="px-4 py-3 font-medium">Coding basics</td>
											<td class="px-4 py-3">Algorithms, loops, sequencing</td>
											<td class="px-4 py-3">Scratch, Blockly</td>
										</tr>
										<tr class="border-b border-primary/10">
											<td class="px-4 py-3 font-medium">Online etiquette</td>
											<td class="px-4 py-3">Polite communication, privacy</td>
											<td class="px-4 py-3">Forum discussions, emails</td>
										</tr>
									</tbody>
								</table>
							</div>
						</div>
						<div class="space-y-6">
							<h2 class="text-2xl font-bold text-primary">12.3 Coding Basics</h2>
							<p class="text-muted-foreground">Coding: Giving a computer step-by-step instructions</p>
							<div class="bg-secondary/5 p-4 rounded-lg my-4">
								<h4 class="font-semibold mb-3">Key concepts:</h4>
								<ul class="list-disc list-inside space-y-2 text-sm text-muted-foreground ml-4">
									<li><strong>Algorithm:</strong> Step-by-step plan</li>
									<li><strong>Sequence:</strong> Correct order of instructions</li>
									<li><strong>Loop:</strong> Repeat instructions</li>
									<li><strong>Debug:</strong> Fix errors</li>
									<li><strong>Output:</strong> Result of instructions</li>
								</ul>
							</div>
							<div class="bg-primary/5 p-4 rounded-lg my-4">
								<p class="font-semibold mb-2">Example Activity:</p>
								<p class="text-sm text-muted-foreground">Human Algorithm — students act out a sequence of instructions (stand → clap → sit → smile).</p>
							</div>
						</div>
						<div class="space-y-6">
							<h2 class="text-2xl font-bold text-primary">12.4 Digital Tools & Resources</h2>
							<div class="relative overflow-x-auto shadow-sm rounded-lg my-4">
								<table class="w-full text-sm">
									<thead class="bg-primary/5">
										<tr>
											<th class="px-4 py-3 text-left font-semibold">Tool</th>
											<th class="px-4 py-3 text-left font-semibold">Use in Class</th>
										</tr>
									</thead>
									<tbody>
										<tr class="border-b border-primary/10">
											<td class="px-4 py-3 font-medium">Laptop/Tablet</td>
											<td class="px-4 py-3">Coding, research, presentations</td>
										</tr>
										<tr class="border-b border-primary/10">
											<td class="px-4 py-3 font-medium">Projector/Screen</td>
											<td class="px-4 py-3">Demonstrations, videos, slides</td>
										</tr>
										<tr class="border-b border-primary/10">
											<td class="px-4 py-3 font-medium">Learning Apps</td>
											<td class="px-4 py-3">Math, reading, language skills</td>
										</tr>
										<tr class="border-b border-primary/10">
											<td class="px-4 py-3 font-medium">Online collaboration</td>
											<td class="px-4 py-3">Google Docs, Padlet</td>
										</tr>
										<tr class="border-b border-primary/10">
											<td class="px-4 py-3 font-medium">Safe internet</td>
											<td class="px-4 py-3">Research, virtual tours, multimedia projects</td>
										</tr>
									</tbody>
								</table>
							</div>
							<div class="bg-primary/5 p-4 rounded-lg my-4">
								<p class="font-semibold text-sm mb-2">💡 Important:</p>
								<p class="text-sm text-muted-foreground">Always supervise students and ensure content is age-appropriate.</p>
							</div>
						</div>
						<div class="space-y-6">
							<h2 class="text-2xl font-bold text-primary">12.5 Child Online Safety</h2>
							<ul class="list-disc list-inside space-y-2 text-sm text-muted-foreground ml-4">
								<li>Never share personal information (full name, address, school, phone number)</li>
								<li>Avoid chatting with strangers or clicking suspicious links</li>
								<li>Report cyberbullying or inappropriate content immediately</li>
								<li>Be kind, respectful, and responsible online</li>
							</ul>
							<div class="bg-primary/5 p-4 rounded-lg my-4">
								<p class="font-semibold text-sm mb-2">💡 Tip:</p>
								<p class="text-sm text-muted-foreground">Model good online behavior for students.</p>
							</div>
						</div>
						<div class="space-y-6">
							<h2 class="text-2xl font-bold text-primary">12.6 Teacher Digital Ethics</h2>
							<ul class="list-disc list-inside space-y-2 text-sm text-muted-foreground ml-4">
								<li>Use only school-approved platforms</li>
								<li>Maintain professional conduct online</li>
								<li>Do not post student images without permission</li>
								<li>Guide students and parents in safe digital practices</li>
							</ul>
						</div>
						<div class="space-y-6">
							<h2 class="text-2xl font-bold text-primary">12.7 Sample Digital Lesson Plan (Scratch Animation)</h2>
							<div class="bg-secondary/5 p-4 rounded-lg my-4">
								<p class="font-semibold mb-3">Class: Secondary 1–3</p>
								<p class="font-semibold mb-3">Topic: Make a sprite move across the screen</p>
								<h4 class="font-semibold mb-2">Steps:</h4>
								<ol class="list-decimal list-inside space-y-2 text-sm text-muted-foreground ml-4">
									<li>Open Scratch or ScratchJr</li>
									<li>Drag motion block and set movement</li>
									<li>Add loop to repeat movement</li>
									<li>Test, adjust speed and direction</li>
									<li>Optional: Add sound or color effects</li>
								</ol>
								<p class="font-semibold mt-4 mb-2">Outcome:</p>
								<p class="text-sm text-muted-foreground">Students create an animation while learning coding logic.</p>
							</div>
						</div>
						<div class="space-y-6">
							<h2 class="text-2xl font-bold text-primary">✅ Module 12 Summary</h2>
							<ul class="list-disc list-inside space-y-2 text-sm text-muted-foreground ml-4">
								<li>Digital education enhances engagement, creativity, and problem-solving</li>
								<li>Basic ICT skills include device handling, internet navigation, typing, digital creativity, and coding</li>
								<li>Coding basics involve algorithms, sequences, loops, debugging, and output</li>
								<li>Online safety requires protecting personal information and reporting cyberbullying</li>
								<li>Teachers must model ethical digital behavior and use approved platforms</li>
							</ul>
						</div>
					</div>`,
					videos: [
						{ youtubeUrl: '', caption: 'Digital Education & Coding Basics' },
						{ youtubeUrl: '', caption: 'Online Safety for Students' },
					],
				},
				sections: [
					{
						id: 's12s1',
						title: '12.1 Importance of Digital Education',
						html: `<div class="space-y-4"><p class="text-muted-foreground">Digital education enhances engagement, creativity, and problem-solving. It prepares students for 21st-century skills and digital literacy, and encourages collaboration, research, and self-directed learning. Example: Interactive coding app creates animations while developing logic.</p></div>`,
						youtubeUrl: '',
						caption: 'Digital Education',
					},
					{
						id: 's12s2',
						title: '12.2 Basic ICT Skills for Secondary Students',
						html: `<div class="space-y-4"><p class="text-muted-foreground">Skills include device handling (laptop, tablet), internet navigation (safe browsing, research), typing & text processing (Word, Google Docs), digital creativity (PowerPoint, Canva), coding basics (Scratch, Blockly), and online etiquette (polite communication, privacy).</p></div>`,
						youtubeUrl: '',
						caption: 'ICT Skills',
					},
					{
						id: 's12s3',
						title: '12.3 Coding Basics',
						html: `<div class="space-y-4"><p class="text-muted-foreground">Coding is giving a computer step-by-step instructions. Key concepts: Algorithm (step-by-step plan), Sequence (correct order), Loop (repeat instructions), Debug (fix errors), Output (result). Example: Human Algorithm activity where students act out instructions.</p></div>`,
						youtubeUrl: '',
						caption: 'Coding Basics',
					},
					{
						id: 's12s4',
						title: '12.4 Digital Tools & Resources',
						html: `<div class="space-y-4"><p class="text-muted-foreground">Tools include laptop/tablet (coding, research), projector/screen (demonstrations), learning apps (math, reading), online collaboration (Google Docs, Padlet), and safe internet (research, virtual tours). Always supervise students and ensure age-appropriate content.</p></div>`,
						youtubeUrl: '',
						caption: 'Digital Tools',
					},
					{
						id: 's12s5',
						title: '12.5 Child Online Safety',
						html: `<div class="space-y-4"><p class="text-muted-foreground">Never share personal information (name, address, school, phone). Avoid chatting with strangers or clicking suspicious links. Report cyberbullying or inappropriate content immediately. Be kind, respectful, and responsible online. Model good online behavior.</p></div>`,
						youtubeUrl: '',
						caption: 'Online Safety',
					},
					{
						id: 's12s6',
						title: '12.6 Teacher Digital Ethics',
						html: `<div class="space-y-4"><p class="text-muted-foreground">Use only school-approved platforms, maintain professional conduct online, do not post student images without permission, and guide students and parents in safe digital practices.</p></div>`,
						youtubeUrl: '',
						caption: 'Digital Ethics',
					},
					{
						id: 's12s7',
						title: '12.7 Sample Digital Lesson Plan (Scratch Animation)',
						html: `<div class="space-y-4"><p class="text-muted-foreground">Class: Secondary 1–3. Topic: Make a sprite move. Steps: Open Scratch, drag motion block, add loop, test and adjust, add optional effects. Outcome: Students create animation while learning coding logic.</p></div>`,
						youtubeUrl: '',
						caption: 'Scratch Animation Lesson',
					},
				],
				quiz: [
					{
						question: 'Coding is:',
						options: ['Writing letters only', 'Giving instructions to a computer', 'Typing fast', 'Drawing pictures'],
						correctAnswerIndex: 1,
					},
					{
						question: 'A loop in coding is used to:',
						options: ['Repeat instructions', 'Delete files', 'Draw images', 'Type faster'],
						correctAnswerIndex: 0,
					},
					{
						question: 'Digital literacy means:',
						options: ['Using devices responsibly', 'Playing games all day', 'Copying content', 'Watching videos only'],
						correctAnswerIndex: 0,
					},
					{
						question: 'Safe online behavior includes:',
						options: ['Sharing personal info', 'Asking teacher before using apps', 'Chatting with strangers', 'Clicking unknown links'],
						correctAnswerIndex: 1,
					},
					{
						question: 'Scratch is suitable for:',
						options: ['Ages 8+', 'Adults only', 'No age limit', 'Only coding experts'],
						correctAnswerIndex: 0,
					},
					{
						question: 'Teacher digital ethics includes:',
						options: ['Using approved platforms', 'Private chat with students', 'Posting photos without consent', 'Ignoring school policies'],
						correctAnswerIndex: 0,
					},
					{
						question: 'Debugging in coding means:',
						options: ['Fixing errors', 'Writing essays', 'Reading a book', 'Deleting programs'],
						correctAnswerIndex: 0,
					},
					{
						question: 'Human Algorithm Activity teaches:',
						options: ['Step-by-step instructions', 'Silent reading', 'Watching videos', 'Drawing'],
						correctAnswerIndex: 0,
					},
					{
						question: 'Online safety for children includes:',
						options: ['Sharing home address', 'Being polite and respectful', 'Clicking suspicious links', 'Chatting with strangers'],
						correctAnswerIndex: 1,
					},
					{
						question: 'Digital creativity tools include:',
						options: ['Canva, PowerPoint', 'Calculator', 'Textbooks only', 'Pen and paper only'],
						correctAnswerIndex: 0,
					},
					{
						question: 'Teacher should guide parents on:',
						options: ['Safe digital use', 'Ignoring technology', 'Only printing homework', 'Watching TV only'],
						correctAnswerIndex: 0,
					},
					{
						question: 'A safe classroom digital activity is:',
						options: ['Research using approved sites', 'Random social media use', 'Downloading games', 'Sharing personal info'],
						correctAnswerIndex: 0,
					},
					{
						question: 'Coding output is:',
						options: ['Result of instructions', 'Random letters', 'Homework only', 'A game only'],
						correctAnswerIndex: 0,
					},
					{
						question: 'Digital tools help students to:',
						options: ['Learn, create, and collaborate', 'Ignore assignments', 'Only watch videos', 'Only memorize'],
						correctAnswerIndex: 0,
					},
					{
						question: 'Teacher modeling good online behavior helps students:',
						options: ['Learn responsibility and safety', 'Ignore rules', 'Chat privately online', 'Copy content'],
						correctAnswerIndex: 0,
					},
				],
			},
		],
	},
	{
		id: 'skills',
		name: 'Skills Training',
		description: 'Vocational instruction, project-based learning, and safety compliance.',
		modules: [
		
		],
	},
];

export function getLevelById(levelId: AcademyLevelId): AcademyLevel | undefined {
	return ACADEMY_LEVELS.find(l => l.id === levelId);
}

export function getModule(levelId: AcademyLevelId, moduleId: string): { level: AcademyLevel; module: AcademyModule } | undefined {
	const level = getLevelById(levelId);
	if (!level) return undefined;
	const module = level.modules.find(m => m.id === moduleId);
	if (!module) return undefined;
	return { level, module };
}

// Final Quiz for Nursery Level
export const NURSERY_FINAL_QUIZ: QuizQuestion[] = [
	{
		question: "Nursery education in Cameroon is:",
		options: [
			"Compulsory for all children",
			"Non-compulsory but foundational",
			"Only academic drills",
			"The same as primary school"
		],
		correctAnswerIndex: 1
	},
	{
		question: "What is the primary focus of Nursery 1 (age 3–4)?",
		options: [
			"Pre-literacy skills",
			"Sensory and self-awareness",
			"Writing letters",
			"Exam preparation"
		],
		correctAnswerIndex: 1
	},
	{
		question: "Piaget's Preoperational Stage includes which of the following?",
		options: [
			"Logical reasoning",
			"Symbolic thinking",
			"Abstract thought",
			"Conservation of mass"
		],
		correctAnswerIndex: 1
	},
	{
		question: "According to Erikson, ages 3–5 are in the stage of:",
		options: [
			"Trust vs. Mistrust",
			"Initiative vs. Guilt",
			"Industry vs. Inferiority",
			"Identity vs. Role Confusion"
		],
		correctAnswerIndex: 1
	},
	{
		question: "What is the ideal attention span of a 4-year-old?",
		options: [
			"1–2 minutes",
			"5–8 minutes",
			"10–15 minutes",
			"20 minutes"
		],
		correctAnswerIndex: 1
	},
	{
		question: "A Scheme of Work is:",
		options: [
			"A detailed daily schedule only",
			"A roadmap for the term",
			"A list of children's birthdays",
			"A teacher's diary"
		],
		correctAnswerIndex: 1
	},
	{
		question: "In a daily lesson plan, the first activity is usually:",
		options: [
			"Main activity",
			"Introduction",
			"Greeting & routine",
			"Wrap-up"
		],
		correctAnswerIndex: 2
	},
	{
		question: "When integrating multiple learning areas, which example is correct?",
		options: [
			"Reading only",
			"Counting animal paws, describing, drawing, and discussing care",
			"Singing unrelated songs",
			"Doing worksheets only"
		],
		correctAnswerIndex: 1
	},
	{
		question: "Best ratio of play to structured learning in nursery lessons:",
		options: [
			"50% play, 50% structured",
			"70% play, 20% structured, 10% routines",
			"30% play, 60% structured",
			"100% structured"
		],
		correctAnswerIndex: 1
	},
	{
		question: "Storytelling and songs help children:",
		options: [
			"Memorize numbers only",
			"Develop memory, language, and empathy",
			"Sit quietly",
			"Replace play"
		],
		correctAnswerIndex: 1
	},
	{
		question: "Classroom games for literacy could include:",
		options: [
			"Sound Bingo",
			"Memorization drills only",
			"Watching videos only",
			"Silent reading"
		],
		correctAnswerIndex: 0
	},
	{
		question: "Using manipulatives effectively requires:",
		options: [
			"Only pictures",
			"Real objects, toys, and touchable materials",
			"Flashcards only",
			"Teacher demonstration only"
		],
		correctAnswerIndex: 1
	},
	{
		question: "What is a key role of the nursery tutor?",
		options: [
			"Lecturing children",
			"Facilitator of play, observer, emotional anchor",
			"Examiner only",
			"Homework setter"
		],
		correctAnswerIndex: 1
	},
	{
		question: "Positive behavior can be encouraged by:",
		options: [
			"Public shaming",
			"Praise, sticker charts, class mascot",
			"Only verbal reprimands",
			"Ignoring children"
		],
		correctAnswerIndex: 1
	},
	{
		question: "For misbehavior, tutors should:",
		options: [
			"Shout at children",
			"Calmly connect, redirect, and offer choices",
			"Use corporal punishment",
			"Ignore the child"
		],
		correctAnswerIndex: 1
	},
	{
		question: "Continuous assessment can be done via:",
		options: [
			"Tests only",
			"Observation, work samples, checklists",
			"Grades only",
			"Peer comparisons"
		],
		correctAnswerIndex: 1
	},
	{
		question: "Effective parent communication includes:",
		options: [
			"Complaints only",
			"Evidence of progress + next goal",
			"Grades only",
			"Ignoring questions"
		],
		correctAnswerIndex: 1
	},
	{
		question: "Tutors should maintain ethics by:",
		options: [
			"Safety first, confidentiality, no corporal punishment",
			"Allowing unsupervised play",
			"Sharing private child info",
			"Ignoring cultural context"
		],
		correctAnswerIndex: 0
	},
	{
		question: "Reflective practice for tutors involves:",
		options: [
			"Only teaching",
			"Weekly journals: what went well, what to change",
			"Ignoring outcomes",
			"Comparing children"
		],
		correctAnswerIndex: 1
	},
	{
		question: "Digital lesson integration includes:",
		options: [
			"Long videos only",
			"Short videos, e-flashcards, supervised tablet use",
			"Unlimited screen time",
			"Independent tablet use only"
		],
		correctAnswerIndex: 1
	},
	{
		question: "Online safety requires:",
		options: [
			"Using full child names online",
			"Parental consent, supervision, safe content",
			"No supervision",
			"Unlimited sharing"
		],
		correctAnswerIndex: 1
	},
	{
		question: "The recommended tablet rotation is:",
		options: [
			"1 per child unlimited",
			"1 per 5 children, 2–3 minutes each",
			"Only one child per class",
			"Unsupervised usage"
		],
		correctAnswerIndex: 1
	},
	{
		question: "Which activity is appropriate for Nursery 3 (age 5–6)?",
		options: [
			"Tracing letters",
			"Scribbling freely only",
			"Memorizing times tables",
			"Reading full sentences"
		],
		correctAnswerIndex: 0
	},
	{
		question: "How can play support cognitive development?",
		options: [
			"It cannot",
			"Through hands-on exploration and problem-solving",
			"Only through worksheets",
			"By sitting quietly"
		],
		correctAnswerIndex: 1
	},
	{
		question: "Example of integrating literacy into a lesson:",
		options: [
			"Singing \"B-I-N-G-O\"",
			"Watching a video silently",
			"Memorizing letters on paper",
			"Reading a novel"
		],
		correctAnswerIndex: 0
	},
	{
		question: "Observation note example for a child:",
		options: [
			"Did okay",
			"Tiku stacked 6 blocks, said 'Look, tall tower!' and helped a friend",
			"Child played",
			"Not observed"
		],
		correctAnswerIndex: 1
	},
	{
		question: "A cross-curricular lesson might combine:",
		options: [
			"Only one skill",
			"Math, language, art, social skills",
			"Memorization only",
			"Teacher lectures only"
		],
		correctAnswerIndex: 1
	},
	{
		question: "Positive classroom rules for nursery include:",
		options: [
			"Listen to friends, use kind hands, walk inside, try your best",
			"Sit quietly all day",
			"No talking, no play",
			"Only follow teacher commands"
		],
		correctAnswerIndex: 0
	},
	{
		question: "What is the main benefit of reflective practice?",
		options: [
			"Compare children publicly",
			"Identify improvements and growth",
			"Reduce lesson planning",
			"Avoid parent communication"
		],
		correctAnswerIndex: 1
	},
	{
		question: "Example of tech integration in a lesson:",
		options: [
			"Video → discussion → hands-on activity",
			"Video only",
			"Tablet only",
			"Ignoring play"
		],
		correctAnswerIndex: 0
	}
];

// Final Quiz for Secondary Level
export const SECONDARY_FINAL_QUIZ: QuizQuestion[] = [
	{
		question: 'Effective lesson delivery begins with:',
		options: [
			'Random activities',
			'Clear learning objectives',
			'Ignoring preparation',
			'Reading silently'
		],
		correctAnswerIndex: 1
	},
	{
		question: 'Active listening in the classroom involves:',
		options: [
			'Interrupting students',
			'Ignoring questions',
			'Paraphrasing and asking clarifying questions',
			'Speaking continuously'
		],
		correctAnswerIndex: 2
	},
	{
		question: 'A formative assessment is conducted:',
		options: [
			'After a term',
			'During lessons',
			'Before the school year',
			'Randomly'
		],
		correctAnswerIndex: 1
	},
	{
		question: 'Summative assessment evaluates:',
		options: [
			'Step-by-step understanding',
			'Cumulative learning',
			'Peer behavior only',
			'Early learning gaps'
		],
		correctAnswerIndex: 1
	},
	{
		question: 'Peer assessment encourages:',
		options: [
			'Reflection and collaboration',
			'Cheating',
			'Laziness',
			'Ignoring feedback'
		],
		correctAnswerIndex: 0
	},
	{
		question: 'Teacher digital ethics requires:',
		options: [
			'Private chat with students',
			'Posting images without consent',
			'Using school-approved platforms',
			'Ignoring guidelines'
		],
		correctAnswerIndex: 2
	},
	{
		question: 'Which of the following is NOT safe online behavior?',
		options: [
			'Telling a teacher about a suspicious message',
			'Sharing personal address online',
			'Being polite in chat',
			'Reporting cyberbullying'
		],
		correctAnswerIndex: 1
	},
	{
		question: 'A "human algorithm" activity teaches:',
		options: [
			'Step-by-step instructions',
			'Watching videos',
			'Coloring',
			'Typing'
		],
		correctAnswerIndex: 0
	},
	{
		question: 'Visual learners benefit most from:',
		options: [
			'Charts, diagrams, and videos',
			'Listening only',
			'Hands-on experiments only',
			'Silent reading only'
		],
		correctAnswerIndex: 0
	},
	{
		question: 'Kinesthetic learners learn best through:',
		options: [
			'Hands-on activities',
			'Reading silently',
			'Watching videos only',
			'Lectures only'
		],
		correctAnswerIndex: 0
	},
	{
		question: 'Intrinsic motivation is:',
		options: [
			'Learning for personal satisfaction',
			'Learning only for rewards',
			'Learning because of fear',
			'Learning from peers only'
		],
		correctAnswerIndex: 0
	},
	{
		question: 'Extrinsic motivation includes:',
		options: [
			'Personal curiosity',
			'Praise, recognition, or rewards',
			'Internal satisfaction',
			'Journaling only'
		],
		correctAnswerIndex: 1
	},
	{
		question: 'Non-verbal communication in class includes:',
		options: [
			'Eye contact, gestures',
			'Only verbal explanation',
			'Giving assignments',
			'Grading tests'
		],
		correctAnswerIndex: 0
	},
	{
		question: 'Digital literacy is:',
		options: [
			'Responsible and effective use of technology',
			'Playing games all day',
			'Copying content from websites',
			'Watching videos only'
		],
		correctAnswerIndex: 0
	},
	{
		question: 'Coding loops are used to:',
		options: [
			'Repeat instructions',
			'Delete files',
			'Draw pictures',
			'Type faster'
		],
		correctAnswerIndex: 0
	},
	{
		question: 'A diagnostic assessment is used:',
		options: [
			'After teaching a topic',
			'Before teaching a new topic',
			'Only for grading',
			'Randomly'
		],
		correctAnswerIndex: 1
	},
	{
		question: 'A safe and inclusive classroom promotes:',
		options: [
			'Bullying',
			'Respect and belonging',
			'Competition only',
			'Isolation'
		],
		correctAnswerIndex: 1
	},
	{
		question: 'Mindfulness in class helps to:',
		options: [
			'Reduce stress and improve focus',
			'Punish students',
			'Distract learners',
			'Replace teaching'
		],
		correctAnswerIndex: 0
	},
	{
		question: 'Effective feedback should be:',
		options: [
			'Specific, actionable, and timely',
			'Vague and delayed',
			'Only negative',
			'Ignored'
		],
		correctAnswerIndex: 0
	},
	{
		question: 'Collaborative learning involves:',
		options: [
			'Peer interaction and group tasks',
			'Silent individual work only',
			'Teacher-only instruction',
			'Watching videos silently'
		],
		correctAnswerIndex: 0
	},
	{
		question: 'Technology should be integrated in lessons to:',
		options: [
			'Replace teachers',
			'Support learning and engagement',
			'Distract students',
			'Only show videos'
		],
		correctAnswerIndex: 1
	},
	{
		question: 'Which is a suitable coding platform for beginners?',
		options: [
			'Scratch',
			'Photoshop',
			'Excel',
			'PowerPoint'
		],
		correctAnswerIndex: 0
	},
	{
		question: 'Online safety for students includes:',
		options: [
			'Sharing school name',
			'Being polite, respectful, and reporting problems',
			'Chatting with strangers',
			'Clicking unknown links'
		],
		correctAnswerIndex: 1
	},
	{
		question: 'A well-prepared lesson includes:',
		options: [
			'Clear instructions, engagement, and assessment',
			'Random improvisation',
			'Ignoring students',
			'Only digital tools'
		],
		correctAnswerIndex: 0
	},
	{
		question: 'Social-emotional learning (SEL) teaches:',
		options: [
			'Self-awareness, empathy, and relationship skills',
			'Memorization only',
			'Only exam techniques',
			'Grading skills'
		],
		correctAnswerIndex: 0
	},
	{
		question: 'Teacher availability supports:',
		options: [
			'Student guidance and emotional support',
			'Only grading',
			'Ignoring learning',
			'Reducing engagement'
		],
		correctAnswerIndex: 0
	},
	{
		question: 'Using multiple teaching techniques helps to:',
		options: [
			'Confuse students',
			'Reach diverse learning needs',
			'Waste time',
			'Only lecture'
		],
		correctAnswerIndex: 1
	},
	{
		question: 'Monitoring student progress helps tutors to:',
		options: [
			'Punish students',
			'Identify trends and adjust teaching',
			'Only assign grades',
			'Ignore weak learners'
		],
		correctAnswerIndex: 1
	},
	{
		question: 'Digital storytelling tools help students to:',
		options: [
			'Create creative projects',
			'Only play games',
			'Memorize content',
			'Ignore learning'
		],
		correctAnswerIndex: 0
	},
	{
		question: 'Early recognition of mental health challenges requires:',
		options: [
			'Ignoring signs',
			'Punishing students',
			'Referral to school counselor or parent',
			'Only grading tests'
		],
		correctAnswerIndex: 2
	}
];

export function getFinalQuiz(levelId: AcademyLevelId): QuizQuestion[] | undefined {
	if (levelId === 'nursery') {
		return NURSERY_FINAL_QUIZ;
	}
	if (levelId === 'secondary') {
		return SECONDARY_FINAL_QUIZ;
	}
	// Add other levels' final quizzes here as needed
	return undefined;
}


