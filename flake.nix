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
            bun
            uv
            mpv
            espeak-ng
          ];

          shellHook = ''
            echo "Jarvis dev environment ready"
            echo "  bun:      $(bun --version)"
            echo "  uv:       $(uv --version)"

            bun install
          '';
        };
      });
}
