import re
import sys
import json
from dataclasses import dataclass, asdict
from typing import Optional, Dict, Tuple


# =========================
# Data model
# =========================
@dataclass
class InBodyFull:
    test_date: Optional[str] = None
    member_id: Optional[str] = None
    age: Optional[int] = None
    sex: Optional[str] = None

    height_cm: Optional[float] = None
    weight_kg: Optional[float] = None
    bmi: Optional[float] = None

    pbf: Optional[float] = None
    body_fat_mass_kg: Optional[float] = None
    ffm_kg: Optional[float] = None
    smm_kg: Optional[float] = None

    tbw_l: Optional[float] = None
    protein_kg: Optional[float] = None
    minerals_kg: Optional[float] = None

    inbody_score: Optional[float] = None
    bmr_kcal: Optional[float] = None
    whr: Optional[float] = None
    visceral_fat_level: Optional[float] = None
    ecw_tbw: Optional[float] = None

    seg_lean: Optional[Dict[str, float]] = None
    seg_fat: Optional[Dict[str, float]] = None


# =========================
# Helpers
# =========================
def _find_first(patterns: Tuple[str, ...], text: str) -> Optional[str]:
    for pat in patterns:
        m = re.search(pat, text, flags=re.IGNORECASE | re.MULTILINE)
        if m:
            return m.group(1).strip()
    return None


def _find_first_float(patterns: Tuple[str, ...], text: str) -> Optional[float]:
    s = _find_first(patterns, text)
    if s is None:
        return None
    s = s.replace(",", ".")
    try:
        return float(s)
    except ValueError:
        return None


def _find_first_int(patterns: Tuple[str, ...], text: str) -> Optional[int]:
    s = _find_first(patterns, text)
    if s is None:
        return None
    try:
        return int(s)
    except ValueError:
        return None


def _parse_segmental_block(text: str, section_title: str) -> Optional[Dict[str, float]]:
    """
    Captures a segmental section block and extracts pairs like:
    Right Arm 3.45 kg
    """
    m = re.search(
        rf"{re.escape(section_title)}\s*(.*?)(?:Segmental|Notes:|$)",
        text,
        flags=re.IGNORECASE | re.DOTALL
    )
    if not m:
        return None

    block = m.group(1)

    pairs = re.findall(
        r"(Right Arm|Left Arm|Trunk|Right Leg|Left Leg|Total)\s+([0-9]+(?:[.,][0-9]+)?)\s*kg",
        block,
        flags=re.IGNORECASE
    )
    if not pairs:
        return None

    out: Dict[str, float] = {}
    for k, v in pairs:
        out[k.strip().lower().replace(" ", "_")] = float(v.replace(",", "."))
    return out


# =========================
# Main parser
# =========================
def parse_inbody_text_full(text: str) -> InBodyFull:
    data = InBodyFull()

    # Accept ":" or "-" or whitespace between label and value
    SEP = r"(?:\s*[:\-]\s*|\s+)"

    data.test_date = _find_first((rf"Test Date{SEP}([0-9]{{4}}-[0-9]{{2}}-[0-9]{{2}})",), text)
    data.member_id = _find_first((rf"Member ID{SEP}([A-Za-z0-9\-_]+)",), text)
    data.age = _find_first_int((rf"Age{SEP}([0-9]{{1,3}})",), text)
    data.sex = _find_first((rf"Sex{SEP}(Male|Female)",), text)

    data.height_cm = _find_first_float((rf"Height{SEP}([0-9]+(?:[.,][0-9]+)?)\s*cm",), text)
    data.weight_kg = _find_first_float((rf"Weight{SEP}([0-9]+(?:[.,][0-9]+)?)\s*kg",), text)
    data.bmi = _find_first_float((rf"\bBMI\b{SEP}([0-9]+(?:[.,][0-9]+)?)",), text)

    data.tbw_l = _find_first_float((rf"Total Body Water\s*\(TBW\){SEP}([0-9]+(?:[.,][0-9]+)?)\s*L",), text)
    data.protein_kg = _find_first_float((rf"Protein{SEP}([0-9]+(?:[.,][0-9]+)?)\s*kg",), text)
    data.minerals_kg = _find_first_float((rf"Minerals{SEP}([0-9]+(?:[.,][0-9]+)?)\s*kg",), text)

    data.body_fat_mass_kg = _find_first_float((rf"Body Fat Mass{SEP}([0-9]+(?:[.,][0-9]+)?)\s*kg",), text)
    data.ffm_kg = _find_first_float((rf"Fat-Free Mass\s*\(FFM\){SEP}([0-9]+(?:[.,][0-9]+)?)\s*kg",), text)
    data.smm_kg = _find_first_float((rf"Skeletal Muscle Mass\s*\(SMM\){SEP}([0-9]+(?:[.,][0-9]+)?)\s*kg",), text)
    data.pbf = _find_first_float((
        rf"Percent Body Fat\s*\(PBF\){SEP}([0-9]+(?:[.,][0-9]+)?)\s*%?",
        rf"(?:Percent Body Fat|PBF){SEP}([0-9]+(?:[.,][0-9]+)?)\s*%?"
    ), text)

    data.bmr_kcal = _find_first_float((
        rf"Basal Metabolic Rate\s*\(BMR\){SEP}([0-9]+(?:[.,][0-9]+)?)\s*kcal",
        rf"\bBMR\b{SEP}([0-9]+(?:[.,][0-9]+)?)\s*kcal"
    ), text)

    data.visceral_fat_level = _find_first_float((rf"Visceral Fat Level{SEP}([0-9]+(?:[.,][0-9]+)?)",), text)
    data.whr = _find_first_float((rf"Waist-Hip Ratio\s*\(WHR\){SEP}([0-9]+(?:[.,][0-9]+)?)",), text)
    data.ecw_tbw = _find_first_float((rf"ECW/TBW{SEP}([0-9]+(?:[.,][0-9]+)?)",), text)

    # Optional fields (if present in other templates)
    data.inbody_score = _find_first_float((rf"InBody Score{SEP}([0-9]+(?:[.,][0-9]+)?)",), text)

    # Segmental blocks
    data.seg_lean = _parse_segmental_block(text, "Segmental Lean Analysis")
    data.seg_fat = _parse_segmental_block(text, "Segmental Fat Analysis")

    return data


# =========================
# PDF text extraction
# =========================
def extract_text_from_pdf(pdf_path: str) -> str:
    import fitz  # PyMuPDF
    doc = fitz.open(pdf_path)
    parts = []
    for page in doc:
        parts.append(page.get_text("text") or "")
    return "\n".join(parts)


# =========================
# CLI runner
# =========================
def main():
    if len(sys.argv) < 2:
        print("Usage: python inbody_parser.py <path_to_pdf>")
        return

    pdf_path = sys.argv[1]
    text = extract_text_from_pdf(pdf_path)

    data = parse_inbody_text_full(text)
    print(json.dumps(asdict(data), ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
