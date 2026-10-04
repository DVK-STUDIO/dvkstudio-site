// La logique de la chaîne au défilement est petite et déterministe : chaque borne est testée.
import { describe, it, expect } from "vitest";
import { SEUILS, borner, etapeDepuisProgres, progresDefilement, rideauDepuisProgres } from "./transformation";

describe("etapeDepuisProgres", () => {
  it("donne les cinq étapes dans l'ordre, aux seuils définis", () => {
    expect(etapeDepuisProgres(0)).toBe(1);
    expect(etapeDepuisProgres(SEUILS[0] - 0.001)).toBe(1);
    expect(etapeDepuisProgres(SEUILS[0])).toBe(2);
    expect(etapeDepuisProgres(SEUILS[1])).toBe(3);
    expect(etapeDepuisProgres(SEUILS[2])).toBe(4);
    expect(etapeDepuisProgres(SEUILS[3])).toBe(5);
    expect(etapeDepuisProgres(1)).toBe(5);
  });
  it("est monotone : l'étape ne recule jamais quand on avance", () => {
    let precedent = 1;
    for (let p = 0; p <= 1.0001; p += 0.005) {
      const e = etapeDepuisProgres(p);
      expect(e).toBeGreaterThanOrEqual(precedent);
      precedent = e;
    }
  });
  it("borne les valeurs hors de [0, 1] et les valeurs invalides", () => {
    expect(etapeDepuisProgres(-3)).toBe(1);
    expect(etapeDepuisProgres(7)).toBe(5);
    expect(etapeDepuisProgres(Number.NaN)).toBe(1);
    expect(borner(Infinity)).toBe(0);
  });
});

describe("rideauDepuisProgres", () => {
  it("reste fermé avant la projection, s'ouvre pendant l'étape 3, reste ouvert ensuite", () => {
    expect(rideauDepuisProgres(0)).toBe(0);
    expect(rideauDepuisProgres(SEUILS[1])).toBe(0);
    expect(rideauDepuisProgres((SEUILS[1] + SEUILS[2]) / 2)).toBeCloseTo(0.5, 5);
    expect(rideauDepuisProgres(SEUILS[2])).toBe(1);
    expect(rideauDepuisProgres(1)).toBe(1);
  });
  it("est monotone", () => {
    let precedent = 0;
    for (let p = 0; p <= 1.0001; p += 0.005) {
      const r = rideauDepuisProgres(p);
      expect(r).toBeGreaterThanOrEqual(precedent);
      precedent = r;
    }
  });
});

describe("progresDefilement", () => {
  it("vaut 0 avant la zone, 1 après, et la fraction parcourue entre les deux", () => {
    expect(progresDefilement(100, 5000, 900)).toBe(0);
    expect(progresDefilement(0, 5000, 900)).toBe(0);
    expect(progresDefilement(-2050, 5000, 900)).toBeCloseTo(0.5, 5);
    expect(progresDefilement(-4100, 5000, 900)).toBe(1);
    expect(progresDefilement(-9000, 5000, 900)).toBe(1);
  });
  it("ne divise pas par zéro quand la zone tient dans la fenêtre", () => {
    expect(progresDefilement(-10, 800, 900)).toBe(0);
    expect(progresDefilement(-10, 900, 900)).toBe(0);
  });
});
