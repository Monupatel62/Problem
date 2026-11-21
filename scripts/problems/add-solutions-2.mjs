import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const bankPath = path.join(__dirname, "../../src/lib/problems/bank.ts");
let bank = readFileSync(bankPath, "utf8");

function addSolutions(slug, solutions) {
  const slugIdx = bank.indexOf(`"slug": "${slug}"`);
  if (slugIdx === -1) { console.log(`❌ Not found: ${slug}`); return; }
  const editorialIdx = bank.indexOf('"editorial":', slugIdx);
  const nextSlug = bank.indexOf('"id":', slugIdx + 10);
  const insertBefore = (editorialIdx > 0 && editorialIdx < nextSlug) ? editorialIdx
    : bank.lastIndexOf('"solutionApproaches":', nextSlug > 0 ? nextSlug : bank.length);
  if (insertBefore === -1) { console.log(`❌ Insert point not found: ${slug}`); return; }
  const solutionsJson = Object.entries(solutions)
    .map(([lang, code]) => {
      const esc = code.replace(/\\/g,"\\\\").replace(/"/g,'\\"').replace(/\n/g,"\\n").replace(/\r/g,"");
      return `      "${lang}": "${esc}"`;
    }).join(",\n");
  const block = `"solutions": {\n${solutionsJson}\n    },\n    `;
  bank = bank.slice(0, insertBefore) + block + bank.slice(insertBefore);
  console.log(`✅ ${slug}`);
}

// Also add missing algorithm problems
addSolutions("cyclically-rotating-a-grid", {
  JavaScript: `function rotateGrid(grid, k) {
  const m=grid.length,n=grid[0].length;
  for(let layer=0;layer<Math.min(m,n)/2;layer++){
    const elems=[];
    const top=layer,bot=m-1-layer,lft=layer,rgt=n-1-layer;
    for(let c=lft;c<=rgt;c++) elems.push(grid[top][c]);
    for(let r=top+1;r<=bot;r++) elems.push(grid[r][rgt]);
    for(let c=rgt-1;c>=lft;c--) elems.push(grid[bot][c]);
    for(let r=bot-1;r>top;r--) elems.push(grid[r][lft]);
    const sz=elems.length,sh=k%sz;
    const rot=[...elems.slice(sh),...elems.slice(0,sh)];
    let idx=0;
    for(let c=lft;c<=rgt;c++) grid[top][c]=rot[idx++];
    for(let r=top+1;r<=bot;r++) grid[r][rgt]=rot[idx++];
    for(let c=rgt-1;c>=lft;c--) grid[bot][c]=rot[idx++];
    for(let r=bot-1;r>top;r--) grid[r][lft]=rot[idx++];
  }
  return grid;
}`,
  Python: `class Solution:
    def rotateGrid(self, grid, k):
        m,n=len(grid),len(grid[0])
        for layer in range(min(m,n)//2):
            top,bot,lft,rgt=layer,m-1-layer,layer,n-1-layer
            elems=[]
            for c in range(lft,rgt+1): elems.append(grid[top][c])
            for r in range(top+1,bot+1): elems.append(grid[r][rgt])
            for c in range(rgt-1,lft-1,-1): elems.append(grid[bot][c])
            for r in range(bot-1,top,-1): elems.append(grid[r][lft])
            sz,sh=len(elems),k%len(elems)
            rot=elems[sh:]+elems[:sh]; idx=0
            for c in range(lft,rgt+1): grid[top][c]=rot[idx]; idx+=1
            for r in range(top+1,bot+1): grid[r][rgt]=rot[idx]; idx+=1
            for c in range(rgt-1,lft-1,-1): grid[bot][c]=rot[idx]; idx+=1
            for r in range(bot-1,top,-1): grid[r][lft]=rot[idx]; idx+=1
        return grid`,
});

// SQL problems
addSolutions("combine-two-tables", {
  SQL: `SELECT p.firstName, p.lastName, a.city, a.state
FROM Person p
LEFT JOIN Address a ON p.personId = a.personId;`,
});

addSolutions("customers-who-never-order", {
  SQL: `SELECT name AS Customers
FROM Customers
WHERE id NOT IN (SELECT customerId FROM Orders);`,
});

addSolutions("select-all-employees", {
  SQL: `SELECT e.name AS Employee
FROM Employee e
JOIN Employee m ON e.managerId = m.id
WHERE e.salary > m.salary;`,
});

addSolutions("second-highest-salary", {
  SQL: `SELECT MAX(salary) AS SecondHighestSalary
FROM Employee
WHERE salary < (SELECT MAX(salary) FROM Employee);`,
});

addSolutions("duplicate-emails", {
  SQL: `SELECT email AS Email
FROM Person
GROUP BY email
HAVING COUNT(*) > 1;`,
});

addSolutions("department-highest-salary", {
  SQL: `SELECT d.name AS Department, e.name AS Employee, e.salary AS Salary
FROM Employee e
JOIN Department d ON e.departmentId = d.id
WHERE (e.departmentId, e.salary) IN (
    SELECT departmentId, MAX(salary) FROM Employee GROUP BY departmentId
);`,
});

addSolutions("rank-scores", {
  SQL: `SELECT score,
  DENSE_RANK() OVER (ORDER BY score DESC) AS rank
FROM Scores
ORDER BY score DESC;`,
});

addSolutions("consecutive-numbers", {
  SQL: `SELECT DISTINCT l1.num AS ConsecutiveNums
FROM Logs l1
JOIN Logs l2 ON l1.id + 1 = l2.id AND l1.num = l2.num
JOIN Logs l3 ON l1.id + 2 = l3.id AND l1.num = l3.num;`,
});

addSolutions("delete-duplicate-emails", {
  SQL: `DELETE p1 FROM Person p1, Person p2
WHERE p1.email = p2.email AND p1.id > p2.id;`,
});

addSolutions("rising-temperature", {
  SQL: `SELECT w1.id
FROM Weather w1
JOIN Weather w2 ON DATEDIFF(w1.recordDate, w2.recordDate) = 1
WHERE w1.temperature > w2.temperature;`,
});

addSolutions("nth-highest-salary", {
  SQL: `CREATE FUNCTION getNthHighestSalary(N INT) RETURNS INT
BEGIN
  SET N = N - 1;
  RETURN (
    SELECT DISTINCT salary FROM Employee
    ORDER BY salary DESC
    LIMIT 1 OFFSET N
  );
END`,
});

// Shell problems
addSolutions("word-frequency", {
  Bash: `cat words.txt | tr -s ' ' '\\n' | sort | uniq -c | sort -r | awk '{print $2, $1}'`,
});

addSolutions("valid-phone-numbers", {
  Bash: `grep -P '^(\\([0-9]{3}\\) [0-9]{3}-[0-9]{4}|[0-9]{3}-[0-9]{3}-[0-9]{4})$' file.txt`,
});

addSolutions("transpose-file", {
  Bash: `awk '{
    for (i=1; i<=NF; i++) {
        if (NR==1) row[i]=$i;
        else row[i]=row[i] " " $i;
    }
}
END {
    for (i=1; i<=NF; i++) print row[i];
}' file.txt`,
});

addSolutions("tenth-line", {
  Bash: `awk 'NR==10' file.txt
# Alternative:
# sed -n '10p' file.txt`,
});

addSolutions("count-lines-matching-pattern", {
  Bash: `grep -ci 'error' file.txt`,
});

// Concurrency problems
addSolutions("print-in-order", {
  Python: `import threading

class Foo:
    def __init__(self):
        self.s1 = threading.Semaphore(0)
        self.s2 = threading.Semaphore(0)

    def first(self, printFirst):
        printFirst()
        self.s1.release()

    def second(self, printSecond):
        self.s1.acquire()
        printSecond()
        self.s2.release()

    def third(self, printThird):
        self.s2.acquire()
        printThird()`,
});

addSolutions("print-foobar-alternately", {
  Python: `import threading

class FooBar:
    def __init__(self, n):
        self.n = n
        self.foo_sem = threading.Semaphore(1)
        self.bar_sem = threading.Semaphore(0)

    def foo(self, printFoo):
        for _ in range(self.n):
            self.foo_sem.acquire()
            printFoo()
            self.bar_sem.release()

    def bar(self, printBar):
        for _ in range(self.n):
            self.bar_sem.acquire()
            printBar()
            self.foo_sem.release()`,
});

addSolutions("building-h2o", {
  Python: `import threading

class H2O:
    def __init__(self):
        self.h_sem = threading.Semaphore(2)
        self.o_sem = threading.Semaphore(0)
        self.h_count = 0
        self.lock = threading.Lock()

    def hydrogen(self, releaseHydrogen):
        self.h_sem.acquire()
        releaseHydrogen()
        with self.lock:
            self.h_count += 1
            if self.h_count == 2:
                self.h_count = 0
                self.o_sem.release()

    def oxygen(self, releaseOxygen):
        self.o_sem.acquire()
        releaseOxygen()
        self.h_sem.release()
        self.h_sem.release()`,
});

addSolutions("the-dining-philosophers", {
  Python: `import threading

class DiningPhilosophers:
    def __init__(self):
        self.forks = [threading.Semaphore(1) for _ in range(5)]

    def wantsToEat(self, philosopher, pickLeftFork, pickRightFork,
                   eat, putLeftFork, putRightFork):
        left = philosopher
        right = (philosopher + 1) % 5
        # Always pick lower-numbered fork first to prevent deadlock
        first, second = (left, right) if left < right else (right, left)
        self.forks[first].acquire()
        self.forks[second].acquire()
        pickLeftFork(); pickRightFork(); eat()
        putLeftFork(); putRightFork()
        self.forks[second].release()
        self.forks[first].release()`,
});

addSolutions("fizz-buzz-multithreaded", {
  Python: `import threading

class FizzBuzz:
    def __init__(self, n):
        self.n = n
        self.lock = threading.Semaphore(1)
        self.fizz_lock = threading.Semaphore(0)
        self.buzz_lock = threading.Semaphore(0)
        self.fizzbuzz_lock = threading.Semaphore(0)
        self.number_lock = threading.Semaphore(0)

    def fizz(self, printFizz):
        for i in range(1, self.n+1):
            if i%3==0 and i%5!=0:
                self.fizz_lock.acquire(); printFizz(); self.lock.release()

    def buzz(self, printBuzz):
        for i in range(1, self.n+1):
            if i%5==0 and i%3!=0:
                self.buzz_lock.acquire(); printBuzz(); self.lock.release()

    def fizzbuzz(self, printFizzBuzz):
        for i in range(1, self.n+1):
            if i%15==0:
                self.fizzbuzz_lock.acquire(); printFizzBuzz(); self.lock.release()

    def number(self, printNumber):
        for i in range(1, self.n+1):
            self.lock.acquire()
            if i%3==0 and i%5==0: self.fizzbuzz_lock.release()
            elif i%3==0: self.fizz_lock.release()
            elif i%5==0: self.buzz_lock.release()
            else: printNumber(i); self.lock.release()`,
});

writeFileSync(bankPath, bank, "utf8");
console.log("\n✅ All remaining solutions added!");
