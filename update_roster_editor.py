import re

with open('src/components/TeamEditorModal.tsx', 'r') as f:
    content = f.read()

# 1. Remove the Age Group block
age_group_pattern = r'\{\/\* Age Group \(U16 default for this team, U15, U14, U17\) \*\/\}[\s\S]*?</div>\s*</div>\s*\{\/\* Exact Birthday Date of Birth \*\/\}'
content = re.sub(age_group_pattern, '{/* Exact Birthday Date of Birth */}', content)

# 2. Simplify Date of Birth logic
old_dob_logic = """                        onChange={(e) => {
                          const bday = e.target.value;
                          const bYear = bday ? new Date(bday).getFullYear() : editingPlayer.birthYear;
                          let calculatedAgeGroup = editingPlayer.ageGroup || 'U16';
                          if (bYear === 2011) calculatedAgeGroup = 'U15';
                          else if (bYear === 2012) calculatedAgeGroup = 'U14';
                          else if (bYear === 2010) calculatedAgeGroup = 'U16';
                          else if (bYear === 2009) calculatedAgeGroup = 'U17';
                          setEditingPlayer({
                            ...editingPlayer,
                            birthday: bday,
                            birthYear: bYear && !isNaN(bYear) ? bYear : editingPlayer.birthYear,
                            ageGroup: calculatedAgeGroup,
                          });
                        }}"""

new_dob_logic = """                        onChange={(e) => {
                          const bday = e.target.value;
                          const bYear = bday ? new Date(bday).getFullYear() : editingPlayer.birthYear;
                          setEditingPlayer({
                            ...editingPlayer,
                            birthday: bday,
                            birthYear: bYear && !isNaN(bYear) ? bYear : editingPlayer.birthYear,
                          });
                        }}"""
content = content.replace(old_dob_logic, new_dob_logic)

with open('src/components/TeamEditorModal.tsx', 'w') as f:
    f.write(content)
