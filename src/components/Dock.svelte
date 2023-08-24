<script>
  import { onMount } from "svelte";
  import { i18n, syncData } from "@/store";

  let title;
  let data;
  let emptyProject;

  i18n.subscribe((v) => {
    title = v.title;
    emptyProject = v.emptyProject;
  });

  syncData.subscribe((v) => {
    data = v;
  })
  

  onMount(() => {
    console.log(syncData);
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
  <span data-type="min" class="block__icon b3-tooltips b3-tooltips__sw"
    ><svg><use xlink:href="#iconMin" /></svg></span>
</div>
<div class="fn__flex-1">
  <div class="plugin-dida-dock">
    {#each data as item}
      {#if !item.project.closed}
        <div class="dida-dock-project">
          <div class="dida-dock-project-name">{item.project.name}</div>
          {#if item.tasks.length > 0}
            {#each item.tasks as task}
              <div class="dida-dock-task">
                <svg><use xlink:href="#iconUncheck" /></svg>{task.title}
              </div>
            {/each}
          {:else}
            <div class="dida-dock-project-empty">{emptyProject}</div>
          {/if}
        </div>
      {/if}
    {/each}
  </div>
</div>
