import { memo } from "react";
import { DisplayTitle, Title, GithubIcon, InstagramIcon, DiscordIcon } from "./_components";
import { cn } from "./utils";

const HomePage = memo(() => (
  <div className="flex items-center justify-center flex-1">
    <div className="flex flex-col items-center justify-center h-full w-full min-h-0 gap-8 text-center select-none animate-slideIn">

      <div className="flex flex-col gap-y-2">
        <DisplayTitle text="Viennalytics" />
        <Title text="A Comprehensive Analysis on Chess Openings" />
      </div>

      <hr className="w-full text-white max-w-1/3" />

      <div className={cn("flex flex-row items-center justify-between w-1/2 max-w-80 gap-x-4")}>
        <a href="https://github.com/elphoun/viennalytics" aria-label="Github">
          <GithubIcon />
        </a>
        <a href="https://www.uwdatascience.ca/" aria-label="DSC">
          <img src="dsc.svg" alt="DSC" className={cn("h-full transition-all max-h-8 hover:brightness-50")} />
        </a>
        <a href="https://www.instagram.com/uwaterloodsc/" aria-label="Instagram">
          <InstagramIcon />
        </a>
        <a href="https://discord.gg/Vj5aVvahKm" aria-label="Discord">
          <DiscordIcon />
        </a>
      </div>
    </div>
  </div>
));

export default HomePage;
