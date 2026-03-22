{
  description = "Jarvis TTS - offline voice for Claude Code";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = nixpkgs.legacyPackages.${system};
      in
      {
        devShells.default = pkgs.mkShell {
          packages = with pkgs; [
            bun        # TypeScript runtime and package manager
            uv         # Python package manager — runs kokoro_speak.py and manages Kokoro dependencies
            mpv        # Audio playback — streams WAV output from Kokoro to speakers
            espeak-ng  # Phoneme fallback used internally by Kokoro for out-of-vocabulary words
          ];

          shellHook = ''
            echo "Jarvis dev environment ready"
            echo "  bun:      $(bun --version)"
            echo "  uv:       $(uv --version)"

            bun install
            uv sync
          '';
        };
      });
}
