<script>
    export let data;
</script>

<article class="max-w-150 text-center mx-auto sm:mt-16">
    <h1>{data.eventInfo.name}</h1>
    
    <i class="i-carbon-hourglass block h-24 w-24 m-auto"></i>

    <p class="mt-8 text-8">
        Event not started yet.
    </p>

    <p class="text-6">
        Publish time: {data.eventInfo.publishTime.toLocaleString()}
    </p>
</article>