import sys
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
import audit_topic_learning_quality as audit
import fix_lessons


class EditorialValidationTests(unittest.TestCase):
    def test_every_required_criterion_is_mandatory(self):
        criteria = dict.fromkeys(audit.evaluate(""), True)
        self.assertTrue(audit.classify(criteria, "contenido específico")["practicable"])
        for key in criteria:
            if key == "visual":
                continue
            with self.subTest(criterion=key):
                self.assertFalse(audit.classify({**criteria, key: False}, "")["practicable"])
        self.assertFalse(audit.classify(criteria, "passed: true")["practicable"])

    def test_hidden_scaffold_cannot_supply_project_or_limits(self):
        markdown = """### Tema 1: Ejemplo
Texto propio.
<!-- DEFINITIVE-COMPLEMENTS:START -->
El proyecto integrador tiene límites.
<!-- DEFINITIVE-COMPLEMENTS:END -->
"""
        visible = audit.student_visible_content(markdown)
        _, block = next(audit.topic_blocks(visible))
        self.assertFalse(audit.evaluate(block)["project"])
        self.assertFalse(audit.evaluate(block)["limitsDecision"])

    def test_visual_score_cannot_replace_required_criteria(self):
        criteria = dict.fromkeys(audit.evaluate(""), True)
        criteria["visual"] = False
        self.assertTrue(audit.classify(criteria, "contenido específico")["practicable"])
        criteria.update(visual=True, project=False)
        self.assertFalse(audit.classify(criteria, "contenido específico")["practicable"])

    def test_real_file_types_and_commands_are_recognized(self):
        for filename, command in [("index.html", "python3 -m http.server"),
                                  ("styles.css", "curl localhost:8000"),
                                  ("schema.sql", "psql -f schema.sql"),
                                  ("backup.sql", "pg_dump db"),
                                  ("tareas.py", "git log")]:
            with self.subTest(filename=filename):
                result = audit.evaluate(f"{filename}\n```bash\n{command}\n```")
                self.assertTrue(result["filePath"])
                self.assertTrue(result["runCommand"])

    def test_regex_patterns_are_not_mistaken_for_damaged_prose(self):
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "example.py"
            path.write_text('import re\npattern = re.compile(r"ya?ml")\nmessage = r"configuraci?n"\n')
            with patch.object(fix_lessons, "iter_text_check_files", return_value=[str(path)]):
                issues = fix_lessons.find_text_quality_issues()
            self.assertEqual([issue[1] for issue in issues], [3])


if __name__ == "__main__":
    unittest.main()
