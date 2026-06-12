import type { IconName } from "./icons";

export interface SocialLink {
  label: string;
  icon: IconName;
  color: string;
  href?: string;
  copy?: string;
  toast?: string;
}

export interface Track {
  title: string;
  src: string;
}

export const profile = {
  kanji: "夜",
  name: "yoru",
  tagline: "hobbyist developer, music enjoyer, and rhythm gamer",
};

export const links: SocialLink[] = [
  {
    label: "Discord",
    icon: "discord",
    color: "#5865f2",
    copy: "yo.ru",
    toast: "Copied — <b>yo.ru</b>",
  },
  {
    label: "GitHub",
    icon: "github",
    color: "#e6edf3",
    href: "https://github.com/yo-ru",
  },
  {
    label: "Twitch",
    icon: "twitch",
    color: "#9146ff",
    href: "https://twitch.tv/yoru_osu",
  },
  {
    label: "Rhythia",
    icon: "rhythia",
    color: "#88a9fc",
    href: "https://rhythia.com/player/85208",
  },
  {
    label: "osu!",
    icon: "osu",
    color: "#ff66aa",
    href: "https://osu.ppy.sh/users/11292480",
  },
  {
    label: "VRChat",
    icon: "vrchat",
    color: "#5edee7",
    href: "https://vrchat.com/home/user/usr_a9f7f9ef-3491-465d-93df-e0c4ad97babf",
  },
];

export const tracks: Track[] = [
  {
    title: "Caleb Belkin - I Fall In Love Too Easily",
    src: "/music/caleb_belkin_i_fall_in_love_too_easily.mp3",
  },
  {
    title: "Hisohkah - School Rooftop",
    src: "/music/hisohkah_school_rooftop.mp3",
  },
  {
    title: "Kudasai - Dream Of Her",
    src: "/music/kudasai_dream_of_her.mp3",
  },
  {
    title: "Kudasai - The Girl I Haven't Met",
    src: "/music/kudasai_the_girl_i_havent_met.mp3",
  },
  {
    title: "Lovey - Ever Since",
    src: "/music/lovey_ever_since.mp3",
  },
  {
    title: "Yagih Mael - Fly Me To The Moon",
    src: "/music/yagih_mael_fly_me_to_the_moon.mp3",
  },
];

export const slides: string[] = Array.from(
  { length: 7 },
  (_, i) => `/slides/${String(i + 1).padStart(2, "0")}.webp`,
);

export const settings = {
  slideInterval: 9000,
  slideFade: 1800,
  shuffleSlides: true,
  startVolume: 0.12,
  autoplayOnFirstInteraction: true,
};
