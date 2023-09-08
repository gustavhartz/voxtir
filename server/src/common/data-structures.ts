export class FIFOSet<T> {
  private maxLength: number;
  private set: Set<T>;
  private queue: T[];

  constructor(maxLength = 1000) {
    if (maxLength <= 0) {
      throw new Error('maxLength must be greater than 0');
    }
    this.maxLength = maxLength;
    this.set = new Set<T>();
    this.queue = [];
  }

  add(item: T): void {
    if (!this.set.has(item)) {
      if (this.set.size >= this.maxLength) {
        const removedItem = this.queue.shift(); // Remove the earliest added element
        if (removedItem) {
          this.set.delete(removedItem);
        }
      }

      this.set.add(item); // Add the new element
      this.queue.push(item);
    }
  }

  has(item: T): boolean {
    return this.set.has(item);
  }

  get size(): number {
    return this.set.size;
  }
}
