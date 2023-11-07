<script>
  import { onMount } from "svelte";
  import { i18n, syncData } from "@/store";

  let title;
  let data;
  let emptyProject;
  let copyToday;
  let copyFinished;

  let showCompleted = false;

  i18n.subscribe((v) => {
    title = v.title;
    emptyProject = v.emptyProject;
    copyToday = v.copyToday;
    copyFinished = v.copyFinished;
  });

  syncData.subscribe((v) => {
    data = v;
  });

  const toggleShowCompleted = () => {
    showCompleted = !showCompleted;
  };


  onMount(() => {
    document
      .querySelector(".plugin-dida-dock")
      .addEventListener("copy", (event) => {
        const selection = document.getSelection();
        const text = selection.toString();
        const result = text
          .trim()
          .split("\n")
          .map((line) => `* [ ] ${line}`)
          .join("\n");
        // @ts-ignore
        event.clipboardData.setData("text/plain", result);
        event.preventDefault();
      });
  });
</script>

<div class="block__icons">
  <div class="block__logo">
    <svg><use xlink:href="#iconDida" /></svg>
    {title}
  </div>
  <span class="fn__flex-1 fn__space" />
  <span
    class="block__icon b3-tooltips b3-tooltips__sw"
    aria-label="显示/隐藏已完成任务"
    on:click={() => toggleShowCompleted()}
  >
    {#if showCompleted}
      <svg><use xlink:href="#iconEyeoff" /></svg>
    {:else}
      <svg><use xlink:href="#iconEye" /></svg>
    {/if}
  </span>
  <span data-type="min" class="block__icon b3-tooltips b3-tooltips__sw"
    ><svg><use xlink:href="#iconMin" /></svg></span
  >
</div>
<div class="fn__flex-1">
  <div class="plugin-dida-dock">
    {#each data as item}
      {#if !item.project.closed}
        <div class="dida-dock-project">
          <div class="dida-dock-project-name">{item.project.name}</div>
          {#if item.tasks.length > 0}
            {#each item.tasks as task}
              {#if task.status !== 2 || showCompleted}
                <div class="dida-dock-task">
                  {#if task.status === 2}
                    <svg><use xlink:href="#iconCheck" /></svg><span
                      class="completed-task task">{task.title}</span
                    >
                  {:else}
                    <svg><use xlink:href="#iconUncheck" /></svg><span
                      class="task">{task.title}</span
                    >
                  {/if}
                </div>
              {/if}
            {/each}
          {:else}
            <div class="dida-dock-project-empty">{emptyProject}</div>
          {/if}
        </div>
      {/if}
    {/each}
  </div>
</div>
