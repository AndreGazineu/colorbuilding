// Função para calcular o Delta E usando CIEDE2000
function ciede2000(L1, a1, b1, L2, a2, b2) {
    const kL = 1, kC = 1, kH = 1;
    const deg360InRad = Math.PI * 2;
    const deg180InRad = Math.PI;
    const pow25to7 = 6103515625;

    const C1 = Math.sqrt(a1 ** 2 + b1 ** 2);
    const C2 = Math.sqrt(a2 ** 2 + b2 ** 2);
    const aC1C2 = (C1 + C2) / 2;

    const G = 0.5 * (1 - Math.sqrt(Math.pow(aC1C2, 7) / (Math.pow(aC1C2, 7) + pow25to7)));
    const a1p = (1 + G) * a1;
    const a2p = (1 + G) * a2;
    const C1p = Math.sqrt(a1p ** 2 + b1 ** 2);
    const C2p = Math.sqrt(a2p **2 + b2 ** 2);
    const h1p = Math.atan2(b1, a1p);
    const h2p = Math.atan2(b2, a2p);

    const dLp = L2 - L1;
    const dCp = C2p - C1p;
    const dhp = h2p - h1p;
    const dHp = 2 * Math.sqrt(C1p * C2p) * Math.sin(dhp / 2);

    const Lp = (L1 + L2) / 2;
    const Cp = (C1p + C2p) / 2;

    let Hp = (h1p + h2p) / 2;
    if (Math.abs(h1p - h2p) > deg180InRad) {
        Hp -= deg180InRad;
    }

    const T = 1 - 0.17 * Math.cos(Hp - deg180InRad / 6) + 0.24 * Math.cos(2 * Hp) + 0.32 * Math.cos(3 * Hp + deg180InRad / 30) - 0.20 * Math.cos(4 * Hp - deg180InRad * 63 / 180);
    const SL = 1 + (0.015 * ((Lp - 50) ** 2)) / Math.sqrt(20 + (Lp - 50) ** 2);
    const SC = 1 + 0.045 * Cp;
    const SH = 1 + 0.015 * Cp * T;

    const RT = -2 * Math.sqrt(Math.pow(Cp, 7) / (Math.pow(Cp, 7) + pow25to7)) * Math.sin(deg180InRad / 60 * Math.exp(-((Hp - deg180InRad * 275 / 360) ** 2) / (deg180InRad * 25 / 360) ** 2));

    return Math.sqrt((dLp / SL) ** 2 + (dCp / SC) ** 2 + (dHp / SH) ** 2 + RT * (dCp / SC) * (dHp / SH));
}
