import { memo } from "react";
import {
  DisplayTitle,
  Title,
  GithubIcon,
  InstagramIcon,
  DiscordIcon,
} from "./_components";
import { cn } from "./utils";
import Image from "next/image";

const HomePage = memo(() => (
  <div className="flex items-center justify-center h-full w-full flex-1">
    <div className="flex flex-col items-center justify-center h-full w-full min-h-0 gap-8 text-center select-none animate-slideIn">
      <div className="flex flex-col gap-y-2">
        <DisplayTitle text="Viennalytics" />
        <Title text="A Comprehensive Analysis on Chess Openings" />
      </div>

      <hr className="w-full text-white max-w-1/3" />

      <div
        className={cn(
          "flex flex-row items-center justify-between w-1/2 max-w-80 gap-x-4",
        )}
      >
        <a
          href="https://github.com/elphoun/viennalytics"
          target="_blank"
          aria-label="View project on GitHub"
        >
          <GithubIcon />
        </a>
        <a
          href="https://www.uwdatascience.ca/"
          target="_blank"
          aria-label="Visit University of Waterloo Data Science Club"
        >
          <Image
            src="/dsc.svg"
            alt="University of Waterloo Data Science Club"
            width={32}
            height={32}
            className={cn("h-full transition-all max-h-8 hover:brightness-50")}
            priority={false}
            loading="lazy"
            style={{ width: "auto", height: "auto" }}
          />
        </a>
        <a
          href="https://www.instagram.com/uwaterloodsc/"
          target="_blank"
          aria-label="Follow us on Instagram"
        >
          <InstagramIcon />
        </a>
        <a
          href="https://discord.gg/Vj5aVvahKm"
          target="_blank"
          aria-label="Join our Discord server"
        >
          <DiscordIcon />
        </a>
      </div>
    </div>
  </div>
));

export default HomePage;
