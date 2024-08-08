<script>
	import YellowStar from './YellowStar.svelte';
	import demoVideo from './demo3.mp4';
</script>

<section class="grow flex justify-center items-center gap-4 py4 m0 w-full">
	<div
		class="md:items-initial md:justify-center flex flex-col md:flex-row items-center gap-4 p4 max-w-300"
	>
		<div class="flex flex-col gap-4 items-center justify-center px-4 text-center">
			<h1 class="text-center text-10 mb-4 2xl:mb-8">The Sprint Orienteering Analysis platform</h1>

			<p class="text-5">
				Routechoice DB is a complete toolbox for Sprint Orienteering Analysis. It helps the <a
					href="https://www.facebook.com/coursedorientation.clubfrance">French Orienteering Team</a
				>
				to analyse trainings and competitions on a daily basis, to perform at the
				<a href="https://www.youtube.com/watch?v=3_YgmFA6ljw">highest international level</a>.
			</p>

			<div class="flex flex-col sm:flex-row justify-center gap-4 w-full sm:w-fit">
				<a
					role="button"
					href="/events/11dcad47-62d4-4de5-afc7-34492f729eb9/map"
					class="!flex outline w-full sm:w-fit items-center justify-center gap-2 text-nowrap"
				>
					<i class="i-carbon-demo block w-6 h-6"></i>

					See the demo
				</a>

				<a
					role="button"
					class="!flex w-full sm:w-fit items-center justify-center gap-2 text-nowrap"
					href="/events"
				>
					<i class="i-carbon-3d-curve-auto-colon block w-6 h-6 text-white"></i>

					Go to events
				</a>
			</div>

			<div class="flex items-center justify-center gap4">
				<div class="shrink-0">
					<enhanced:img
						src="./charly.jpeg"
						alt="Portrait de Chary Boichut"
						class="h-20 w-20 sm:h30 sm:w30 rounded-full"
					/>
				</div>

				<blockquote>
					<div class="flex gap2 justify-center mb2">
						<YellowStar class="h5 w5 text-yellow" />
						<YellowStar class="h5 w5 text-yellow" />
						<YellowStar class="h5 w5 text-yellow" />
						<YellowStar class="h5 w5 text-yellow" />
						<YellowStar class="h5 w5 text-yellow" />
					</div>

					“Thanks to Routechoice DB, our analysis are deeper and quicker, helping us to extract more
					benefits from our training. Its developper Nicolas Rio is super reactive to our requests,
					and even proactive with suggestions to keep it as the best tool available in the
					orienteering world.”

					<footer>
						<cite>— Charly Boichut | French Orienteering Team Head Coach</cite>
					</footer>
				</blockquote>
			</div>
		</div>

		<!-- svelte-ignore a11y-media-has-caption -->
		<video
			controls
			class="w-80% sm:w-initial mt-8 sm:mt-0 sm:max-h-80vh sm:max-w-75 b-solid b-black b-8 rounded-5"
		>
			<source src={demoVideo} type="video/mp4" />
		</video>
	</div>
</section>
