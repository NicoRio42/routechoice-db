import { writable } from "svelte/store";

const showSideBar = writable(!navigator.userAgentData.mobile);

export default showSideBar;
